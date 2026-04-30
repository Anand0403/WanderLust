const mongoose = require("mongoose");
const Review = require("./reviews");
const User = require("./user");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    image:{
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b" : v
        }
    },
    price:{
        type: Number
    },
    location:{
        type:String
    },
    country: {
        type: String
    },
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type:Schema.Types.ObjectId,
        ref: "User"
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in : listing.reviews}});
    }
    
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;