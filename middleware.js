const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js"); // for Server side ListingSchema  and reviewSchema validation

// Joi listing Schema validation Middleware
module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){  
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

// Joi Review Schema Validation middleware
module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if(error){  
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){ // req.isAuthenticate() is a Passport method which checks whether the user is logged in or not

        // redirectUrl to visit the same same before login window popup
        req.session.redirectUrl = req.originalUrl;

        req.flash("error","Login is required to perform this operation!");
        return res.redirect("/login");
    }
    next();
}

// As we are using the passport, it will reset the session every time so the regdirectUrl will be empty , 
// if we directly use it in the user so we are creating another middleware to store reddirectUrl in the locals so it can be accessed in the users..
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        console.log(res.locals.redirectUrl);
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing.owner._id.equals(req.user._id)){
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    let {reviewId} = req.params;
    let review = await Review.findById(reviewId);

    if(!review.author._id.equals(req.user._id)){
        req.flash("error", "You are not the Author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};