const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// midle Ware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbi1i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");



        const menuDB = client.db("bestuBoss").collection('menu')
        const cartDB = client.db("bestuBoss").collection('carts')


        app.get("/menu", async (req, res) => {
            const result = await menuDB.find().toArray()
            res.send(result)
        })

        // carts api 

        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const reqult = await cartDB.deleteOne(query)
            res.send(reqult)
        })

        app.get("/carts", async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await cartDB.find(query).toArray()
            res.send(result)
        })

        app.post('/carts', async (req, res) => {
            const body = req.body
            const result = await cartDB.insertOne(body)
            res.send(result)
        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("boss server is running")
})

app.listen(port, () => {
    console.log(`server running port is ${port}`)
})