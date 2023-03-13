const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.local || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4cizlao.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('Unauthorized Access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN,
        function(err, decoded){
            if(err){
                return res.status(403).sent({message: 'Forbidden Access'})
            }
            req.decoded = decoded;
            next()
        })
}

async function run() {
    try{
        const productsCollections = client.db('OdvutSolution').collection('products');
        const usersCollections = client.db('OdvutSolution').collection('users');

        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollections.findOne(query);
            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
            next();
        }

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email:email};
            const user = await usersCollections.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '5d'});
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
        })
        app.get('/products', async(req, res) => {
            const query = {};
            const product = await productsCollections.find(query).toArray();
            res.send(product)
        })   
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id:new ObjectId(id) };
            const result = await productsCollections.findOne(filter);
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollections.find(query).toArray();
            res.send(users);
        })

        app.get('/userEmail', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail };
            const result = await usersCollections.find(query).toArray();
            res.send(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollections.findOne(query);
            res.send(user);
        })

        // Check admin api
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollections.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' });
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);

        });
        app.post('/products', async(req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            res.send(result);
        })
        app.put('/editInfo/:id', async (req, res) => {
            const id = req.params.id;
            const info = req.body;
            console.log(info)
            const filter = { _id:new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set : {
                    title: info.title,
                }
            }
            const result = await productsCollections.updateOne(filter, updatedDoc, options);
            res.send(result)
        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:new ObjectId(id)}
            const result = await productsCollections.deleteOne(query);
            // console.log(result);
            res.send(result);
        })
    }
    finally{

    }

}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Odvut Solution is running on port 5000')
})
app.listen(port, () => {
    console.log(`Odvut solution is running on ${port}`)
})