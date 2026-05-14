const express = require("express");
const router  = express.Router();
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");

const upload = multer({ storage });


const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controller/listing.js");

//Index Route
router.get("/",wrapAsync(listingController.index));

// Create Route (GET -> FORM -> SUBMIT -> POST)
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.post("/", validateListing, upload.single('listing[image]'), wrapAsync(listingController.createListing));

// Show Route
router.get("/:id",wrapAsync(listingController.showListing));

// UPDATE (Edit and Update Route)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderUpdateForm));

router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingController.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;