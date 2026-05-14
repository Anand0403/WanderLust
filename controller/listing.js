const Listing = require("../models/listing");
const {cloudinary} = require("../cloudConfig");
const ExpressError = require("../utils/ExpressError");


module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req,res) => {
    let newListing = new Listing(req.body.listing);

    // Cloudinary gives this automatically
    if (req.file) {
        newListing.image = {
            url: req.file.path,        // Cloudinary URL
            filename: req.file.filename // public_id
        };
    }
    newListing.owner = req.user._id;

    await newListing.save();
    req.flash("success", "New Listing created!");
    return res.redirect("/listings");
};

module.exports.showListing = async (req,res) => {
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
};

module.exports.renderUpdateForm = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist..");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    return res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    if (!req.body || !req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing..");
    }

    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Update basic fields
    Object.assign(listing, req.body.listing);

    // If new image uploaded
    if (req.file) {
        // delete old image
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        // save new image
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if(listing.image && listing.image.filename){
        await cloudinary.uploader.destroy(listing.image.filename);
    }

    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    if(!deleteListing){
        req.flash("error", "Listing not found");
    }
    res.redirect(`/listings`);
}