const express = require('express');
const port = process.env.PORT || 5000;
const cors = require("cors");
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
        res.send('Running Chaccu')
})
app.listen(port,()=>{
    console.log("Sunchi bondhu 50000000000",port)
    console.log("Sunchi bondhu 50000000000")
})

