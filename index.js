const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser')
const crypto = require('crypto')
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const SSLCommerzPayment = require('sslcommerz')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;
const doctors = require("./routes/doctors");
const doctor = require("./routes/doctor");
const nurse = require('./routes/nurse')
const staff = require('./routes/staff')
const ambulance = require("./routes/ambulance");
const pharmacy = require("./routes/pharmacy");
const lab = require("./routes/lab");
const ambooking = require("./routes/ambooking");
const medicine = require("./routes/Medicine")
const blogs = require("./routes/blogs");
const booking = require("./routes/booking");
const hospitaldoctors = require("./routes/hospitaldoctors");
const news = require("./routes/news");
const hospitaldoctorsbooking = require("./routes/hospitaldoctorsbooking")
// const available = require("./routes/available");
const app = express();
// 
// middlewares
app.use(cors());
app.use(express.json());

//use the doctor.js file to 
//endpoints that start with /doctors
app.use("/doctors", doctors);
app.use("/doctor", doctor);
app.use("/nurse", nurse);
app.use("/staff", staff);
app.use("/hospitaldoctors", hospitaldoctors);
app.use("/pharmacy", pharmacy);
app.use("/lab", lab);
app.use("/blogs", blogs);
app.use("/bookingdoctors", booking);
app.use("/news", news);
app.use("/hospitaldoctorsbooking", hospitaldoctorsbooking);
app.use("/ambulance", ambulance);
app.use("/medicine" , medicine);
app.use("/ambooking" , ambooking);
// app.use("/available" , available);
app.use("/medicine", medicine);
// socket io
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  app.use("/medicine", medicine);
  // app.use("/available" , available);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });
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

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@products.q5pma.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6jd9d0.mongodb.net/${process.env.DB}`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
   
    app.post('/zoom', (req, res) => {
      const iat = Math.round((new Date().getTime() - 30000) / 1000)
      const exp = iat + 60 * 60 * 2

      const oHeader = { alg: 'HS256', typ: 'JWT' }

      const oPayload = {
        app_key: process.env.ZOOM_VIDEO_SDK_KEY,
        tpc: 'testing',
        role_type: 1,
        // user_identity: req.body.userIdentity,
        // session_key: req.body.sessionKey,
        version: 1,
        iat: iat,
        exp: exp,
        meetingNumber: 1234,
        userEmail: '',
        passWord: '1234',
        leaveUrl: 'http://localhost:3000/zoom-meeting'
      }

      const sHeader = JSON.stringify(oHeader)
      const sPayload = JSON.stringify(oPayload)
      const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_VIDEO_SDK_SECRET)

      res.json({
        signature: signature
      })
    })

// booking appointment by anik 

// payment part 
// app.patch('/hospitaldoctorsbooking/:id', async(req,res)=>{
//   const paymentCollection = client.db(process.env.DB).collection('payments');
//   const id = req.params.id;
//   const payment = req.body;
//   const filter = {_id:ObjectId(id)};
//   const updatedDoc = {
//       $set:{
//         paid:true,
//         transactionId:payment.transactionId
//       }
//   }
//   const result = await paymentCollection.insertOne(payment);
//   const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
//   const updatedbooking = await hospitaldoctorsbookingCollection.updateOne(filter,updatedDoc);
//   res.send(updatedDoc);
// })






//sslcommerz init
app.get('/init', (req, res) => {
  const data = {
      total_amount: 100,
      currency: 'EUR',
      tran_id: 'REF123',
      success_url: 'http://localhost:5000/success',
      fail_url: 'http://yoursite.com/fail',
      cancel_url: 'http://yoursite.com/cancel',
      ipn_url: 'http://yoursite.com/ipn',
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'cust@yahoo.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      multi_card_name: 'mastercard',
      value_a: 'ref001_A',
      value_b: 'ref002_B',
      value_c: 'ref003_C',
      value_d: 'ref004_D'
  };
  const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASS,false) //true for live default false for sandbox
  sslcommer.init(data).then(data => {
      //process the response that got from sslcommerz 
      //https://developer.sslcommerz.com/doc/v4/#returned-parameters
      res.redirect(data.GatewayPageURL);
  });
})
app.post('/success', async(req,res)=>{
  console.log(req.body)
  res.status(200).json(req.body)
})

app.get('/available', async(req,res) => {
  const hospitaldoctorsCollection = client.db(process.env.DB).collection('hospitaldoctors');
   
  const date = req.query.date || 'Oct 26, 2022';
  // step 1 
  const services = await hospitaldoctorsCollection.find().toArray();
  // step 2 
  const hospitaldoctorsbookingCollection = client.db(process.env.DB).collection('hospitaldoctorsbooking');
  const query = {date:date};
  const bookings = await hospitaldoctorsbookingCollection.find(query).toArray();
  // step 3 
  services.forEach(service =>{
    const servicebookings = bookings.filter(b=>b.treatment === service.name);
    const booked = servicebookings.map(s=> s.slot);
    const available = service.slots.filter(s=>!booked.includes(s));
    service.available = available;
    // service.booked = booked;

  })
  res.send(services);
})

    // const productsCollection = client
    //   .db(process.env.DB)
    //   .collection(process.env.COLLECTION);
    // const usersCollection = client.db(process.env.DB).collection("users");
    // Blood Doner Posting to Database
    app.post('/bloodDoner', async (req, res) => {
      const donerInfo = req.body
      const bloodDonerCollection = client.db(process.env.DB).collection("bloodDoner");
      const result = await bloodDonerCollection.insertOne(donerInfo);
      res.send(result);
    })
    // Blood Doner List Get
    app.get('/bloodDonerList', async (req, res) => {
      const query = {}
      const bloodDonerCollection = client.db(process.env.DB).collection("bloodDoner");
      const cursor = bloodDonerCollection.find(query);
      const doners = await cursor.toArray();
      res.send(doners);
    })

    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
    // All user post to a Database
    app.post("/api/users", async (req, res) => {
      const user = req.body
      const usersCollection = client.db(process.env.DB).collection("users");
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    // Search for a specific user from the DB

    app.get('/api/user', async (req, res) => {
      const email = req.query.email;
      console.log(email)
      const query = { email: email };
      const usersCollection = client.db(process.env.DB).collection("users");
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (user === null) {
        res.send({ "text": "No user Found" })
      } else {
        res.send(user);
      }

    })
    // see all User from the DB
    app.get("/api/allUsers", async (req, res) => {
      const query = {}
      const usersCollection = client.db(process.env.DB).collection("users");
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    })
    // Search for specific user using ID

    app.put('/api/allUsers', async (req, res) => {
      const updatedStatus = req.body;
      const email = req.query.email
      const usersCollection = client.db(process.env.DB).collection("users");
      const filter = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: { role: updatedStatus?.role }
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })



    // See all databases
    app.get("/api/dbs", async (req, res) => {
      const collections = client.db(process.env.DB).listCollections();
      const cursor = collections;
      const dbs = await cursor.toArray()
        .then(data => data.map(item => item.name))
      res.send(dbs);
    });

    // See all doctors
    app.get("/api/doctors", async (req, res) => {
      const doctorsCollection = client.db(process.env.DB).collection('doctors');
      const query = {};
      const cursor = doctorsCollection.find(query);
      const doctors = await cursor.toArray();
      res.send(doctors);
    });

    // See individual doctor
    app.get("/api/doctors/:id", async (req, res) => {
      const id = req.params.id;
      const doctorsCollection = client.db(process.env.DB).collection('doctors');
      const query = {};
      const cursor = doctorsCollection.find(query);
      let doctor = await cursor.toArray();
      doctor = await doctor.filter((doctor) => doctor._id == id);
      res.send(doctor);
    });

    // Add new Doctor
    app.post("/api/doctors", async (req, res) => {
      const newDoctor = req.body;
      const doctorsCollection = client.db(process.env.DB).collection('doctors');
      const result = await doctorsCollection.insertOne(newDoctor);
      res.send(result);
    });

    // UPDATE Doctor Info
    app.post("/api/doctors/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log(req.body);
      const query = { _id: ObjectId(id) };
      const doctorsCollection = client.db(process.env.DB).collection('doctors');
      let doctor = await doctorsCollection.findOne(query);
      console.log(doctor);
      doctor = { ...doctor, ...req.body };
      const result = await doctorsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: doctor }
      );
      const newResult = await doctorsCollection.findOne(query);
      res.send(newResult);
    });

    // See all meds in Pharmacy
    app.get("/api/medicines", async (req, res) => {
      const medicineCollection = client.db(process.env.DB).collection('medicine');
      const query = {};
      const cursor = medicineCollection.find(query);
      const medicines = await cursor.toArray();
      res.send(medicines);
    });

    // See individual medicine
    app.get("/api/medicine/:id", async (req, res) => {
      const id = req.params.id;
      const medicinesCollection = client.db(process.env.DB).collection('medicine');
      const query = {};
      const cursor = medicinesCollection.find(query);
      let medicine = await cursor.toArray();
      medicine = await medicine.filter((medicine) => medicine._id == id);
      res.send(medicine);
    });

    // Add new medicine
    app.post("/api/medicines", async (req, res) => {
      const newMedicine = req.body;
      const medicinesCollection = client.db(process.env.DB).collection('medicine');
      const result = await medicinesCollection.insertOne(newMedicine);
      res.send({ result });
    });

    // UPDATE medicine Info
    app.post("/api/medicines/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log(req.body);
      const query = { _id: ObjectId(id) };
      const medicinesCollection = client.db(process.env.DB).collection('medicine');
      let medicine = await medicinesCollection.findOne(query);
      console.log(medicine);
      medicine = { ...medicine, ...req.body };
      const result = await medicinesCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: medicine }
      );
      const newResult = await medicinesCollection.findOne(query);
      res.send(newResult);
    });



    // --------------  END OF CODE // DON'T LOOK BELOW THIS LINE ------------- //


    // PRODUCTS API - READ ALL
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = {};
      const cursor = productsCollection.find(query);
      let products = await cursor.toArray();
      products = await products.filter((product) => product.uid == id);
      res.send(products);
    });

    //READ - ONE
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // POST, CREATE
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // UPDATE
    app.post("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log(req.body);
      const query = { _id: ObjectId(id) };
      let product = await productsCollection.findOne(query);
      console.log(product);
      if (req.body.increaseByOne) product.quantity = product.quantity + 1;
      else if (req.body.decreaseByOne) {
        product.quantity = product.quantity - 1;
        product.quantitySold = product.quantitySold + 1;
      } else if (req.body.newQuantity) product.quantity = req.body.newQuantity;
      else if (req.body.addQuantity)
        product.quantity = product.quantity + req.body.addQuantity;
      else if (req.body.edititem) {
        product = { ...product, ...req.body }
      }

      const result = await productsCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: product }
      );

      const newResult = await productsCollection.findOne(query);
      res.send(newResult);
    });

    // DELETE
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //CREATE
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } catch (error) {
    res.send(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Products Server");
});

app.get("/hero", (req, res) => {
  res.send("Hero meets hero ku");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});

server.listen(8000, () => console.log("server is running on port 8000"))
