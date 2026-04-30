const express = require("express");
const router  = express.Router();
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

//Index Route
router.get("/",wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// Create Route (GET -> FORM -> SUBMIT -> POST)
router.get("/new",isLoggedIn, (req,res) => {
    res.render("listings/new.ejs");
});

router.post("/", validateListing, wrapAsync(async (req,res) => {

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing created!");
    return res.redirect("/listings");
}));

// Show Route
router.get("/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }   
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist..");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

// UPDATE (Edit and Update Route)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist..");
        return res.redirect("/listings");
    }
    return res.render("listings/edit.ejs",{listing});
}));

router.put("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    if(!req.body || !req.body.listing){
        throw new ExpressError(400, "Send valid data for listing..");
    }
    let { id } = req.params;
    // Spread the listing object to ensure Mongoose picks up nested fields correctly
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated!");
    return res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    if(!deleteListing){
        req.flash("error", "Listing not found");
    }
    res.redirect(`/listings`);
}));

module.exports = router;