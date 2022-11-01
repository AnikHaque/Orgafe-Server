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
  ///staff
  const staffCollection = client.db(process.env.DB).collection("staff");

  try {
    await client.connect();
    // also use this for speciality
    router
      .route("/")
        .get(async (req, res) => {          
          const query = {};
          const cursor = await staffCollection.find(query);
          const staffs = await cursor.toArray();
          await res.send(staffs);
        })
        .post(async (req, res) => {
          const newstaff = req.body;
          const result = await staffCollection.insertOne(newstaff);
          await res.send(result);
        });

    router
      .route("/profile/:id")
        .get(async (req, res) => {
          const id = req.params.id;
          const query = {};
          const cursor = await staffCollection.find(query);
          let staff = await cursor.toArray();
          staff = await staff.filter((staff) => staff._id == id);
          await res.send(staff);
        })
        .post(async (req, res) => {
          const id = req.params.id;
          // console.log(id);
          // console.log(req.body);
          const query = { _id: ObjectId(id) };
          let staff = await staffCollection.findOne(query);
          // console.log(doctor);
          staff = { ...staff, ...req.body };
          const result = await staffCollection.updateOne(
            { _id: ObjectId(id) },
            { $set: staff }
          );
          const newResult = await staffCollection.findOne(query);
          await res.send(newResult);
        })
        .delete(async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await staffCollection.deleteOne(query);
          await res.send(result);
        });

  } finally {
  }
}

run().catch(console.dir);

module.exports = router;