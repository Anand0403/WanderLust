const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");

// Signup router
router.get("/signup", userController.renderSignUpForm);

router.post("/signup", wrapAsync(userController.signUpUser));

// Login router
router.get("/login", userController.renderLoginForm);

router.post(
    "/login", 
    saveRedirectUrl, //middleware to save the rredirectUrl before logging in
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true
    }), 
    userController.loginUser
); 

// logout Router WITH PASSPORT
router.get("/logout", userController.logoutUser);


module.exports = router;