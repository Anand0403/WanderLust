const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs",ejsMate);

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
};

app.get("/",(req,res) => {
    res.send("Hi i am root");
});

// Joi listing Schema validation Middleware
let validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){  
        let errMsg = error.details.map(el => el.message.replaceAll('"', '')).join(", ");

        console.log(error);
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//Index Route
app.get("/listings",wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// Create Route (GET -> FORM -> SUBMIT -> POST)
app.get("/listings/new",(req,res) => {
    res.render("listings/create.ejs");
});

app.post("/listings", validateListing, wrapAsync(async (req,res) => {

    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show Route
app.get("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

// UPDATE (Edit and Update Route)
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

app.put("/listings/:id", wrapAsync(async (req, res) => {
    if(!req.body || !req.body.listing){
        throw new ExpressError(400, "Send valid data for listing..");
    }
    let { id } = req.params;
    // Spread the listing object to ensure Mongoose picks up nested fields correctly
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);;
    if(!deleteListing){
        return res.send("Listing not found");
    }
    res.redirect(`/listings`);
}));

// 404 Error Handler Midlleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Server Side ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{statusCode, message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});