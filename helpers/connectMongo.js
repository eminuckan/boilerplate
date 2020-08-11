const mongoose = require('mongoose');

const connectMongo = () =>{
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true,useFindAndModify:false})
    .then(() =>{
        console.log("*** MongoDB Connection Successful");
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = connectMongo;