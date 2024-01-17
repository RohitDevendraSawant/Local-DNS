import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";

import connectToMongo from "./db.js";
import DNS from "./models/DNS.js";

const PORT = 3000;
const app = express();

const corsOption = {
    origin : "http://localhost:3000",
    methods : "GET, POST, PUT, DELETE",
    credentials : true
}

app.use(bodyParser.json());
app.use(cors(corsOption));


app.get("/api/dns2/getDomainData/:domainName", async (req, res)=>{
    try {
        const domainName  = req.params.domainName;

        const domainData = await DNS.findOne({domain: domainName});
        
        if (!domainData) {
            return res.status(404).json({message: "NOTFOUND"});
        }

        return res.status(200).json({domainData});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server error"});
    }
});

app.post("/api/dns2/setDomainData", async (req, res)=>{
    try {
        const { domain, ip } = req.body;
        let domainData;
        console.log(req.body);

        if (!domain || domain.trim().length===0 || !ip || ip.trim().length===0 ) {
            return res.status(400).json({message: "Invalid data"});
        }

        try {
            domainData = await DNS.findOne({domain});
        } 
        catch(error){}

        if (domainData) {
            return res.status(400).json({message: "Domain already exist."});
        }

        const newDomainData = new DNS(req.body);
        newDomainData.save();
        return res.status(200).json({message: "Domain data saved"});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
});


connectToMongo().then(()=> (
    app.listen(PORT, (req, res) => {
        console.log("Server is running at http://localhost:" + PORT);
    })
));







