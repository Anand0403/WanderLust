const mongoose = require("mongoose");
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
    }
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;