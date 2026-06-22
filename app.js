
 require('dotenv').config();

const dbUrl = process.env.ATLASDB_URL;



const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path=require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require("express-session");
const mongoStore= require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingRoute = require("./routes/listing.js");
const reviewRoute  = require("./routes/review.js");
const userRoute = require("./routes/user.js");


app.use (express.urlencoded({extended:true} ));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


main().then(() => console.log('Connected to MongoDB'))
.catch(err => console.log(err));


async function main(){
    await mongoose.connect(dbUrl);
}

const store = mongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
       secret: process.env.SECRET 
    },
    touchAfter:24 * 3600 ,
});


store.on("error",()=>{
console.log("error in mongo session store".err);
});

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



app.use(session(sessionOption));
app.use (flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
     res.locals.error= req.flash("error");
     res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "pooja@gmail.com",
//         username: "delta-student",
//     });
//     let registerUser = await User.register(fakeUser,"helloworld");
//     res.send(registerUser);
// });

app.use("/listings",listingRoute);
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute)


app.all("/{*any}",(req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


app.use((err,req,res,next)=>{
    let{statusCode = 500,message="Something went wrong"}=err;
   res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});