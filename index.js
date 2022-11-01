const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json()); 
//Orgafe
// password: gDwMJg9rnDihiOaC 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lx750.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("orgafe");
       const productscollection = database.collection("products");
        const menubookingcollection = database.collection("menubooking");
    // // //   const reservecollection = database.collection("reserve");
         const userscollection = database.collection("users");
         const reviewCollection = database.collection("reviews");
   
      // GET API FOR SHOWING ALL clocks
app.get('/products', async(req, res) => {
    const cursor = productscollection.find({});
    const hotels = await cursor.toArray();
    res.send(hotels);
})
       
// GET API FOR my BOOKED ROOMS & all booked rooms
app.get('/menubooking', async(req, res) => {
  let query = {};
  const email = req.query.email;
if(email){
  query = {email: email};
}
    const cursor = menubookingcollection.find(query);
    const room = await cursor.toArray();
    res.send(room);
})



// GET API FOR SHOWING INDIVIDUAL ROOM DETAILS 
app.get('/products/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id:ObjectId(id)};
  const hotel = await productscollection.findOne(query);
  res.json(hotel);

})
// // get api for all reviews 
app.get('/reviews', async(req,res)=>{
  const cursor = reviewCollection.find({});
  const reviews = await cursor.toArray();
  res.send(reviews);
});

// post api for posting reviews 
app.post('/reviews', async(req,res)=>{
  const review = req.body;
  console.log('hit the post api',review);

  const result = await reviewCollection.insertOne(review);
   res.json(result)

});

// //   POST API TO ADD clock 
app.post('/products', async(req, res) => {
    const newhotel = req.body; 
    const result = await productscollection.insertOne(newhotel);
    console.log('hitting the post',req.body);
    console.log('added hotel', result)
    res.json(result);
          
  })

// //   POST API TO ADD reservation
// app.post('/reserve', async(req, res) => {
//   const newhotel = req.body; 
//   const result = await reservecollection.insertOne(newhotel);
//   console.log('hitting the post',req.body);
//   console.log('added hotel', result)
//   res.json(result);
        
// })
//   // POST API TO ADD BOOKING OF ANY ROOM 
app.post('/menubooking', async(req, res) => {
  const newroom = req.body; 
  const result = await menubookingcollection.insertOne(newroom);
  console.log('hitting the post',req.body);      
  res.json(result);
        
}) 
//   // POST API FOR USERS 
app.post('/users', async(req, res)=>{
   const user = req.body;
  const result = await userscollection.insertOne(user);
  console.log('added user', result)
   res.json(result);
       })
       // post api for posting reviews 
app.post('/reviews', async(req,res)=>{
  const review = req.body;
  console.log('hit the post api',review);

  const result = await reviewCollection.insertOne(review);
   res.json(result)

}); 
      
// // get users by their email address and make an user admin 
app.get('/users/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {email:email};
  const user = await userscollection.findOne(query);
  let isAdmin= false;
  if(user?.role==='admin'){
isAdmin=true;
  }
  res.json({admin:isAdmin});
})

       // UPSERT USER 
app.put('/users', async (req, res)=>{
   const user = req.body;
  const filter = {email: user.email};
   const options = {upsert: true };
   const updatedoc = {$set: user};
   const result = await userscollection.updateOne(filter,updatedoc,options);
   res.json(result);
 })

// // make an user admin 
app.put('/users/admin', async (req, res)=>{
  const user = req.body;
  console.log('put', user);
  const filter = {email: user.email};
  const updateDoc = {$set: {role:'admin'}};
  const result = await userscollection.updateOne(filter,updateDoc);
  res.json(result);
})

    } 
    finally {
      
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})