// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

let router = express.Router();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;

console.log(uri);

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
        ///doctors
        const hospitaldoctorsCollection = client.db(process.env.DB).collection('hospitaldoctors');
        const query = {};
        const cursor = hospitaldoctorsCollection.find(query);
        const doctors = await cursor.toArray();
        res.send(doctors);
      })
      .post(async(req, res) => {
        const newDoctor = req.body;
        console.log(newDoctor);
        const hospitaldoctorsCollection = client.db(process.env.DB).collection('hospitaldoctors');
        const result = await hospitaldoctorsCollection.insertOne(newDoctor);
        res.send(result);
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const hospitaldoctorsCollection = client.db(process.env.DB).collection('hospitaldoctors');
        const query = {_id:ObjectId(id)};
        const doctor = await hospitaldoctorsCollection.findOne(query);
       
        res.json(doctor);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const hospitaldoctorsCollection = client.db(process.env.DB).collection('hospitaldoctors');
        let doctor = await hospitaldoctorsCollection.findOne(query);
        console.log(doctor);      
        doctor = {...doctor, ...req.body};
        const result = await hospitaldoctorsCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await hospitaldoctorsCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;