// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

let router = express.Router();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

router.use(function(req, res, next) {
  console.log(req.url, "@", Date.now());
  next();
});

async function run(){
  try{
    await client.connect();
    router
      .route("/")
      .get(async(req, res) => {
        ///lab
        const labFacilityCollection = client.db(process.env.DB).collection('lab');
        const query = {};
        const cursor = labFacilityCollection.find(query);
        const labFacilitys = await cursor.toArray();
        res.send(labFacilitys);
      })
      .post(async(req, res) => {
        const newFacility = req.body;
        const labFacilityCollection = client.db(process.env.DB).collection('lab');
        const result = await labFacilityCollection.insertOne(newFacility);
        res.send(result);
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const labFacilityCollection = client.db(process.env.DB).collection('lab');
        const query = {};
        const cursor = labFacilityCollection.find(query);
        let labFacility = await cursor.toArray();
        labFacility = await labFacility.filter((labFacility) => labFacility._id == id);
        res.send(labFacility);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const labFacilityCollection = client.db(process.env.DB).collection('lab');
        let labFacility = await labFacilityCollection.findOne(query);
        console.log(labFacility);      
        labFacility = {...labFacility, ...req.body};
        const result = await labFacilityCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: labFacility }
        );
        const newResult = await labFacilityCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;