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

async function run() {
  ///doctors
  const doctorsCollection = client.db(process.env.DB).collection("hospitaldoctors");

  try {
    await client.connect();
    
    router
      .route("/:id")
      .get(async (req, res) => {
        const id = req.params.id;
        const query = {};
        const cursor = await doctorsCollection.find(query);
        let doctor = await cursor.toArray();
        doctor = await doctor.filter((doctor) => doctor._id == id);
        res.send(doctor);
      })
      .post(async (req, res) => {
        const id = req.params.id;
        // console.log(id);
        // console.log(req.body);
        const query = { _id: ObjectId(id) };
        let doctor = await doctorsCollection.findOne(query);
        // console.log(doctor);
        doctor = { ...doctor, ...req.body };
        const result = await doctorsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await doctorsCollection.findOne(query);
        res.send(newResult);
      });
  } finally {
  }
}

run().catch(console.dir);

module.exports = router;