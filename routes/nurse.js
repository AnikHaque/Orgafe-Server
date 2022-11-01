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
  ///nurse
  const nurseCollection = client.db(process.env.DB).collection("Nurse");

  try {
    await client.connect();
    // also use this for speciality
    router
      .route("/")
        .get(async (req, res) => {          
          const query = {};
          const cursor = await nurseCollection.find(query);
          const nurses = await cursor.toArray();
          res.send(nurses);
        })
        .post(async (req, res) => {
          const newNurse = req.body;
          const result = await nurseCollection.insertOne(newNurse);
          await res.send(result);
        });

    router
      .route("/byDepartment").get(async (req, res) => {
        const NurseCollection = client.db(process.env.DB).collection("Nurse");
        const Departments = await NurseCollection.distinct("Department");
        
        await res.send(Departments);
      });
    
      router
      .route("/department/:id").get(async (req, res) => {
        
        await res.send('hi');
      });

    router
      .route("/:id")
        .get(async (req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const nurse = await nurseCollection.findOne(query);
          await res.send(nurse);
        })
        .post(async (req, res) => {
          const id = req.params.id;
          // console.log(id);
          // console.log(req.body);
          const query = { _id: ObjectId(id) };
          let nurse = await nurseCollection.findOne(query);
          // console.log(doctor);
          nurse = { ...nurse, ...req.body };
          const result = await nurseCollection.updateOne(
            { _id: ObjectId(id) },
            { $set: nurse }
          );
          const newResult = await nurseCollection.findOne(query);
          res.send(newResult);
        })
        .delete(async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await nurseCollection.deleteOne(query);
          res.send(result);
        });

  } finally {
  }
}

run().catch(console.dir);

module.exports = router;