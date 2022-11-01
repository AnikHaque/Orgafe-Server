// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

let router = express.Router();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;

console.log(uri  , 'medicine');

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// router.use(function(req, res, next) {
//   console.log(req.url, "@", Date.now());
//   next();
// });

async function run(){
  try{
    await client.connect();
    router
      .route("/")
      // /products get from database
      .get(async(req, res) => {
        console.log('data get ')
        ///medicine
        const medicineFacilityCollection = client.db(process.env.DB).collection('medicine');
        const query = {};
        const cursor = medicineFacilityCollection.find(query);
        const medicine = await cursor.toArray();
        console.log(medicine , 'dta')
        res.send(medicine);
      })
      .post(async(req, res) => {
        const newFacility = req.body;
        const medicineFacilityCollection = client.db(process.env.DB).collection('medicine');
        const result = await medicineFacilityCollection.insertOne(newFacility);
        res.send(result);
      });

      // get products id wise
    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const medicineFacilityCollection = client.db(process.env.DB).collection('medicine');
        const query = {};
        const cursor = medicineFacilityCollection.find(query);
        let medicineFacility = await cursor.toArray();
        medicineFacility = await medicineFacility.filter((medicineFacility) => medicineFacility._id == id);
        res.send(medicineFacility);
        // const medicineFacilityCollection = client.db(process.env.DB).collection('medicine');
        // const id = req.params.id
        // console.log(id, "id")
        // const query = {_id:ObjectId(id)}
        // console.log(query)
        // const finalresut = await medicineFacilityCollection.findOne(query)
        // console.log(finalresut ,"id wise get " )
        // res.send(finalresut)
      })
      
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const medicineFacilityCollection = client.db(process.env.DB).collection('medicine');
        let medicineFacility = await medicineFacilityCollection.findOne(query);
        console.log(medicineFacility);      
        medicineFacility = {...medicineFacility, ...req.body};
        const result = await medicineFacilityCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: medicineFacility }
        );
        const newResult = await medicineFacilityCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;