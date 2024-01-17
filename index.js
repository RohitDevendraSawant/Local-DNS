import express, { request, response } from "express";
import bodyParser from "body-parser";
import dns from 'native-dns';


import connectToMongo from "./db.js";
import DNS from "./models/DNS.js";
import server from "./dnsServer.js";


const PORT = 3000;
const app = express();

app.use(bodyParser.json());


app.get("/api/dns2/getDomainData/:domainName", async (req, res) => {
  try {
    var question = dns.Question({
      name: 'www.google.com',
      type: 'A',
    });
     
    var start = Date.now();
     
    var requset = dns.Request({
      question: question,
      server: { address: '8.8.8.8', port: 53, type: 'udp' },
      timeout: 1000,
    });
     
    request.on('timeout', function () {
      console.log('Timeout in making request');
    });
     
    requset.on('message', function (err, answer) {
      answer.answer.forEach(function (a) {
        console.log(a.address);
      });
    });
     
    request.on('end', function () {
      var delta = (Date.now()) - start;
      console.log('Finished processing request: ' + delta.toString() + 'ms');
    });
     
    req.send();





    const domainName = req.params.domainName;

    const domainData = await DNS.findOne({ domain: domainName });

    if (!domainData) {
      return res.status(404).json({ message: "NOTFOUND" });
    }

    return res.status(200).json(response.answer);
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.status(200).json({ message: "Domain data saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/dns2/updateDomainData/:id", async (req, res) => {
    try {
        const { domain, ip } = req.body;
        let domainData;
        try {
          domainData = await DNS.findById(req.params.id);
        } catch (error) {
          return res.status(404).json({ message: "Blog not found." })
        }
    
        const updatedDomain = {};
        if (domain) {
          updatedDomain.domain = domain;
        }
        if (ip) {
          updatedDomain.ip = ip;
        }
    
        await DNS.findByIdAndUpdate(
          req.params.id,
          { $set: updatedDomain },
          { new: true }
        );
    
        res.status(200).json({ message: "Domain updated successfully." });
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error." });
      }
});

app.delete("/api/dns2/deleteDomainData/:id", async (req, res) => {
    try {
        let domain = await DNS.findById(req.params.id);
        if (!domain) {
          return res.status(400).json({ message: "Domain not found." });
        }
    
        await DNS.findByIdAndDelete(req.params.id);
    
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
