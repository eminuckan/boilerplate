const express = require('express');
const dotenv = require('dotenv');
const customErrorHandler = require('./middlewares/customErrorHandler'); 
const path = require('path');
const routes = require('./routes');
const connectMongo = require('./helpers/connectMongo');

dotenv.config({
    path:"./config/env/config.env"
});

connectMongo();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.use('/api',routes);

app.use(customErrorHandler);

app.use(express.static(path.join(__dirname,"public")));

app.listen(PORT,() =>{
    console.log(`***App started on ${PORT}*** : ${process.env.NODE_ENV}`);
});
