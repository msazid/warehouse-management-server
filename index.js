const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const cors = require("cors");
require('dotenv').config();
const app = express();


app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ophoy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run (){
        try{
            await client.connect();
            const itemCollection = client.db("ms-grocery").collection('item');
            app.post('/login', async (req, res) => {
                const user = req.body;
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1d'
                });
                res.send({ accessToken });
            })
    
           
            app.get('/item',async(req,res)=>{
                const query = {}
                const cursor = itemCollection.find(query);
                const items = await cursor.toArray()
                res.send(items)
            })
            app.get('/item/:id',async(req,res)=>{
                const id = req.params;
                const query = {_id:ObjectId(id)}
                const result = await itemCollection.findOne(query)
                res.send(result)
            })
            app.put('/item/:id', async (req, res) => {
                const id = req.params;
                const updatedProduct = req.body;
                console.log(updatedProduct);
                const filter = { _id: ObjectId(id) };
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        quantity: updatedProduct.quantity
                    },
                };
                const result = await itemCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            })

            app.delete('/item/:id',async(req,res)=>{
                    const id = req.params.id;
                    const query ={_id:ObjectId(id)};
                    const result = await itemCollection.deleteOne(query);
                    res.send(result);
                    })

            app.post('/item',async(req,res)=>{
                const newItem = req.body;
                const result = await itemCollection.insertOne(newItem);
                res.send(result);
            })
            app.get('/additem', verifyJWT , async(req,res)=>{
                const decodedEmail = req.decoded.email;
                const email = req.query.email;
                if(email === decodedEmail){
                const query = {email:email};
                const cursor = itemCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
                }
                else{
                    res.status(403).send({message:'Forbidden'})
                }
            })
            
        }
        finally{}
}
run().catch(console.dir)


app.get('/',(req,res)=>{
        res.send('Running Server')
})
app.listen(port,()=>{
    console.log("listening to port",port);
})

