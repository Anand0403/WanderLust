const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js"); // for Server side ListingSchema  and reviewSchema validation
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const {isLoggedIn, isReviewAuthor,validateReview} = require("../middleware.js");



// Post Review Route
router.post("/", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Review added..");
    res.redirect(`/listings/${listing.id}`);
}));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,
    wrapAsync( async(req, res) => {
        let {id, reviewId} = req.params;

        await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review deleted..")
        res.redirect(`/listings/${id}`);
    }

));

module.exports = router;