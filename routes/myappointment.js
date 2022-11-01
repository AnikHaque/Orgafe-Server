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
    //   .get(async(req, res) => {
    //     ///doctors
    //     const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
    //     const query = {};
    //     const cursor = hospitaldoctorsbookingCollection.find(query);
    //     const doctors = await cursor.toArray();
    //     res.send(doctors);
    //   })


      .get(async(req, res) => {
        ///doctors
        const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('myappointment');
        const patient = req.query.patient;
        const query = {patient:patient};
        const bookings = await hospitaldoctorsbookingCollection.find(query).toArray();
        res.send(bookings);
       
      })
      .post(async(req, res) => {
       
        const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
        const booking = req.body;
        console.log(booking);
        const query={treatment:booking.treatment,date:booking.date, patient:booking.patient};
        const exists = await hospitaldoctorsbookingCollection.findOne(query);
        if(exists){
            return res.send({success:false,booking:exists});
        }
        const result = await hospitaldoctorsbookingCollection.insertOne(booking);
       return res.send({success:true,result});
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
        const query = {_id:ObjectId(id)};
        const doctor = await hospitaldoctorsbookingCollection.findOne(query);
        res.json(doctor);
      })
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
        let doctor = await hospitaldoctorsbookingCollection.findOne(query);
        console.log(doctor);      
        doctor = {...doctor, ...req.body};
        const result = await hospitaldoctorsbookingCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await hospitaldoctorsbookingCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;