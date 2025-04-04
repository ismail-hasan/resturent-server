const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
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
        const userDB = client.db("bestuBoss").collection('users')


        const veryfyToken = (req, res, next) => {
            console.log(req.headers.authorization)
            if (!req.headers.authorization) {
                return res.status(403).send({ message: "forbidden bro" })
            }

            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(402).send({ message: "forbidden bro" })
                }
                req.decoded = decoded
                next()
            })
        }

        // jwt token api 
        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token })
        })


        app.get("/menu", async (req, res) => {
            const result = await menuDB.find().toArray()
            res.send(result)
        })

        // users api create 

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userDB.deleteOne(query)
            res.send(result)
        })

        app.get("/users", veryfyToken, async (req, res) => {
            const result = await userDB.find().toArray()
            res.send(result)
        })

        app.post("/users", async (req, res) => {
            const body = req.body
            const email = body.email
            const query = { email: email }
            const exitignUser = await userDB.findOne(query)

            if (exitignUser) {
                return res.send({ message: "user already exit", insertedId: null })
            }

            const result = await userDB.insertOne(body)
            res.send(result)
        })

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const updareDoc = {
                $set: {
                    role: 'admin'
                }
            }

            const result = await userDB.updateOne(filter, updareDoc)
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