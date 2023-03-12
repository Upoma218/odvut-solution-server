const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.local || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        app.get('/products', async(rea, res) => {
            const query = {};
            const product = await productsCollections.find(query).toArray();
            res.send(product)
        })
        app.post('product', async(req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
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