const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

main()
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {console.log(err);});



async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
const initDB = async () => {
   await Listing.deleteMany({});
   initdata.data=initdata.data.map((obj)=>({
    ...obj, owner:"6a36820dd241fbb902dd0a6e"
   }))
   await Listing.insertMany(initdata.data);
   console.log("Database initialized with sample data");
};

initDB();