const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const {isLoggedIn,isOwner,validateListing }= require("../middleware.js");
const multer  = require('multer');
const{storage}=require("../cloudconfig.js")
const upload = multer({ storage });

const listingControllers=require("../controllers/listings.js");


router
.route("/")
.get(wrapAsync(listingControllers.index))
.post(isLoggedIn, validateListing,upload.single('listing[image]'), wrapAsync(listingControllers.createListing)
);
 //new route 
router.get('/new',isLoggedIn, listingControllers.renderNewForm
);
router
.route("/:id")
.get( wrapAsync(listingControllers.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing , wrapAsync(listingControllers.updateListing))
.delete(isLoggedIn,isOwner ,wrapAsync(listingControllers.destroyListing));
module.exports = router;




//edit route
router.get("/:id/edit",isLoggedIn,isOwner , wrapAsync(listingControllers.renderEditForm));
