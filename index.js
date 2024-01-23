import express from "express";
import bodyParser from "body-parser";
import redis from 'redis';
import fetch from "node-fetch";


import connectToMongo from "./db.js";
import DNS from "./models/DNS.js";


const PORT = 3000;
const app = express();

app.use(bodyParser.json());

const redisClient = redis.createClient({
  password: "nnBgvj4JbozDfNlP8VXBCNanDhos5FYz",
  socket: {
    host: "redis-19577.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 19577,
  },
});

(async () => {
  await redisClient.connect();
})();

redisClient.on("connect", () => console.log("Redis client connected"));
redisClient.on("error", (err) =>
  console.log("Redis client connection error", err)
);


app.get("/api/dns2/getDomainData/:domainName", async (req, res) => {
  try {
    console.log("Requested");
    const domainName = req.params.domainName;

    let count = await redisClient.hGet(domainName, 'count');
    if (count == null || count <= 5) {
      let domainData = await DNS.findOne({ domain: domainName });

      if (domainData) {
        if (count > 0) {
          await redisClient.hIncrBy(domainName, 'count', 1);
        }
        else{
          await redisClient.hSet(domainName, 'count', 1);
        }
        return res.status(200).json(domainData);
      }
    }
    else{
      await redisClient.hIncrBy(domainName, 'count', 1);
      if (count > 5){
        let record = await redisClient.hGet(domainName, "record");
        if (record == null) {
          let domainData = await DNS.findOne({ domain: domainName });
          await redisClient.hSet(domainName, "record", JSON.stringify(domainData));
          return res.status(200).json(domainData);
        }
        else{
          let domainData = JSON.parse(record);
          return res.status(200).json(domainData);
        }
      }
    }

    return res.status(404).json({message: "NOTFOUND"});
    
  } catch (error) {
    console.log(error);
    return res.status(404).json({message: "NOTFOUND"});

  }
});

app.post("/api/dns2/setDomainData", async (req, res) => {
  try {
    const { domain, ip } = req.body;
    let domainData;
    console.log(req.body);

    if (
      !domain ||
      domain.trim().length === 0 ||
      !ip ||
      ip.trim().length === 0
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }

    try {
      domainData = await DNS.findOne({ domain });
    } catch (error) {}

    if (domainData) {
      return res.status(400).json({ message: "Domain already exist." });
    }

    const newDomainData = new DNS(req.body);
    newDomainData.save();
    return res.status(201).json({ message: "Domain data saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/dns2/updateDomainData", async (req, res) => {
    try {
        const { domain, ip } = req.body;
    
        const result = await DNS.updateOne(
          {domain : domain},
          {ip: ip}
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({message: "Domain not found"});
        }

        await redisClient.hSet(domain, 'domain', JSON.stringify({domain, ip}));
  
    
        res.status(201).json({ message: "Domain updated successfully." });
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error." });
      }
});

app.delete("/api/dns2/deleteDomainData/:domainName", async (req, res) => {
    try {
        let domain = await DNS.findOne({domain: req.params.domainName});
        if (!domain) {
          return res.status(400).json({ message: "Domain not found." });
        }
        await redisClient.del(req.params.domainName);
        await DNS.deleteOne({domain: req.params.domainName});
    
        return res.status(200).json({ message: "Domain deleted." });
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error." });
      }
});


connectToMongo().then(() =>
  app.listen(PORT, (req, res) => {
    console.log("Server is running at http://localhost:" + PORT);
  })
);
