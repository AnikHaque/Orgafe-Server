// routes/doctor.js routing file
"use strict";
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}
async function run(){
  try{
    await client.connect();
    router
      .route("/")
      // .get(async(req, res) => {
      //   ///doctors
      //   const ambookingCollection = client.db(process.env.DB).collection('ambooking');
      //   const query = {};
      //   const cursor = ambookingCollection.find(query);
      //   const doctors = await cursor.toArray();
      //   res.send(doctors);
      // })


      .get(async(req, res) => {
        ///doctors
        const ambookingCollection = client.db(process.env.DB).collection('ambooking');
        const patient = req.query.patient;
        const query = {patient:patient};
        const bookings = await ambookingCollection.find(query).toArray();
        res.send(bookings);
       
      })
      .post(async(req, res) => {
       
        const ambookingCollection = client.db(process.env.DB).collection('ambooking');
        const booking = req.body;
        console.log(booking);
        const query={treatment:booking.treatment,date:booking.date, patient:booking.patient};
        const exists = await ambookingCollection.findOne(query);
        if(exists){
            return res.send({success:false,booking:exists});
        }
        const result = await ambookingCollection.insertOne(booking);
       return res.send({success:true,result});
      });

    router
      .route("/:id")
      .get(async(req, res) => {
        const id = req.params.id;
        const ambookingCollection = client.db(process.env.DB).collection('ambooking');
        const query = {_id:ObjectId(id)};
        const doctor = await ambookingCollection.findOne(query);
        res.send(doctor);
      })
      
      .post(async(req, res) => {
        const id = req.params.id;
        console.log(id);
        console.log(req.body);
        const query = { _id: ObjectId(id) };
        const ambookingCollection = client.db(process.env.DB).collection('ambooking');
        let doctor = await ambookingCollection.findOne(query);
        console.log(doctor);      
        doctor = {...doctor, ...req.body};
        const result = await ambookingCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: doctor }
        );
        const newResult = await ambookingCollection.findOne(query);
        res.send(newResult);
      });
  }finally{

  }
}

run().catch(console.dir);

module.exports = router;