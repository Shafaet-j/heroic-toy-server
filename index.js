const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fluahev.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toys").collection("toy");

    app.get("/allToys", async (req, res) => {
      const data = req.body;
      const result = await toyCollection.find(data).toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(filter);
      res.send(result);
    });

    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          seller_email: req.query.email,
        };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addToys", async (req, res) => {
      const data = req.body;
      const result = await toyCollection.insertOne(data);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data)
      const filter = { _id: new ObjectId(id) };

      const updateToy = {
        $set: {
          price: data.price,
          available_quantity: data.available_quantity,
          description: data.description,
        },
      };
      const options = { upsert: true };
      const result = await toyCollection.updateOne(filter, updateToy, options);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy server is running");
});

app.listen(port, () => {
  console.log(`toy server is running on port ${port}`);
});
