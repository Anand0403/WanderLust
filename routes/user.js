const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


// Signup router
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res) => {
    try{
        let{username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);

        // to automatically login the user after the signup
        req.login(registeredUsser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to wanderlust!");
            res.redirect("/listings");
        })
    }catch(e){
        req.flash("error", "A user with the given username is already registered");
        res.redirect("/signup");
    }
}));

// Login router
router.get("/login", async(req, res) => {
    res.render('./users/login.ejs');
});

router.post(
    "/login", 
    saveRedirectUrl, //middleware to save the rredirectUrl before logging in
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true
    }), 
    async(req, res) => {
        req.flash("success", "Welcome to wanderlust!");
        let redirect = res.locals.redirectUrl || "/listings";
        res.redirect(redirect);
    }
); 

// logout Router WITH PASSPORT
router.get("/logout", (req, res, next) => {

    // Check if the user is logged in or not first
    if(!req.isAuthenticated()){
        req.flash("error", "You are not logged in!");
        return res.redirect("/listings");
    }

    // req.logout() is the passport method, which will take the callback as the arguement, as it tells what to do after user has been logged out..
    req.logout((err) => { 
        if(err){
            return next(err);
        }
        req.flash("success", "logged out successfully!");
        res.redirect("/listings");
    });
});


module.exports = router;