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
        ///doctors
        const medicineCollection = client.db(process.env.DB).collection('pharmacy');
        const query = {};
        const cursor = medicineCollection.find(query);
        const medicines = await cursor.toArray();
        res.send(medicines);
      })
      .post(async(req, res) => {
        const newMedicine = req.body;
        const medicinesCollection = client.db(process.env.DB).collection('pharmacy');
        const result = await medicinesCollection.insertOne(newMedicine);
        res.send(result);
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const medicinesCollection = client.db(process.env.DB).collection('pharmacy');
        const query = {};
        const cursor =medicinesCollection.find(query);
        let medicine = await cursor.toArray();
        medicine = await medicine.filter((medicine) => medicine._id == id);
        res.send(medicine);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const medicinesCollection = client.db(process.env.DB).collection('pharmacy');
        let medicine = await medicinesCollection.findOne(query);
        console.log(medicine);      
        medicine = {...medicine, ...req.body};
        const result = await medicinesCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: medicine }
        );
        const newResult = await medicinesCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;