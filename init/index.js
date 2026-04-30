const mongoose = require("mongoose");
const {data} = require("./data.js");
const Listing = require("../models/listing.js");

main().then(() => {
    console.log("Connected to DB");
    initDB(); // ✅ call after DB connection
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    const updatedData = data.map((obj) => ({...obj, owner:"69f0ca92da7a6cbec623fff5"}));
    await Listing.insertMany(updatedData);
    console.log("Records inserted sucessfully");
};
