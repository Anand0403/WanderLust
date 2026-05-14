const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUpUser = async(req, res, next) => {
    try{
        let{username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);

        // to automatically login the user after the signup
        req.login(registeredUser, (err) => {
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
};

module.exports.renderLoginForm = (req, res) => {
    res.render('./users/login.ejs');
}

module.exports.loginUser = (req, res) => {
        req.flash("success", "Welcome to wanderlust!");
        let redirect = res.locals.redirectUrl || "/listings";
        res.redirect(redirect);
}

module.exports.logoutUser = (req, res, next) => {

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
}