const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.get("/",(req,res) => {
    res.send("Hi i am root");
});

//Index Route
app.get("/listings",async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

// Show Route
app.get("/listings/:id",async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})



// app.get("/testListing", async (req,res) => {
//     let list1 = new Listing({
//         title: 'House of Thoughts',
//         description: 'House of Thoughts is a calm, creative stay in Mysore for artists, architects & backpackers',
//         image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1415563776108378624/original/8d7eaabf-bfc0-41b7-9f5b-d9cc01b90774.jpeg?im_w=1200',
//         price: 4000,
//         location: 'Mysuru, Karnataka',
//         country: 'India',
//         __v: 0
//     });
//     await list1.save();
//     console.log("Sample was saved");
//     res.send("Test sucessfull");
// });



app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});