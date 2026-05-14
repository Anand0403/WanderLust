if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require('connect-mongo').default;


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const dbUrl = process.env.ATLASDB_URL;




app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs",ejsMate);

const store  =  MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600 // 	Interval (in seconds) between session updates.
  });

  store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
  });

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 3 * 24 * 60 * 60 * 1000, // The time is in the milliseconds
        maxAge: 7* 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
};

app.get("/",(req,res) => {
    res.send("Hi i am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//use static authenticate mothod of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error  = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/registerUser", async(req, res) => {
//     let fakeUser = new User({
//         email:"anand@gmail.com",
//         username: "Apna college",
//     });

//     //  .register(user, password, cb) -> It is a static method to register the new user instance with given password
//     let newUser = await User.register(fakeUser, "hello");
//     res.send(newUser);
// });

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// 404 Error Handler Midlleware
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Server Side ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{statusCode, message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});