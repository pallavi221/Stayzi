const Listing=require("./models/listing");
const ExpressError = require("./utils/ExpressError");
 const Review =require("./models/review.js");
  const{listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
      }
      next();
 }

 module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
 }

module.exports.isOwner=async (req,res,next)=>{
   let {id}=req.params;
     let listing =await Listing.findById(id);
     if( !listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","you are not the owner of this listing");
       return  res.redirect(`/listings/${id}`);
     }
     next();
}

// module.exports.validateListing=(req,res,next)=>{
//      let {error}=listingSchema.validate(req.body,{ abortEarly: false });
//    if(error){
//     let errMsg=error.details.map((el)=>el.message).join(",");
//     throw new ExpressError(400,errMsg);
//    }else{
//     next();
//    }
// };

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body, { abortEarly: false }); // ✅ show all errors
  if (error) {
    const errors = error.details.map(el => el.message); // array of messages
    errors.forEach(err => req.flash("error", err));

    // ✅ Re-render same page instead of throwing error
    return res.render("listings/new", {
      messages: req.flash("error","Please fill all the given Entries"),
      formData: req.body.listing
    });
  }
  next();
};


module.exports.validateReview=(req,res,next)=>{
     let {error}=reviewSchema.validate(req.body);
  
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
   }else{
    next();
   }
};


module.exports.isReviewAuthor=async (req,res,next)=>{
   let {id,reviewId}=req.params;
     let review=await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","you are not the author of this review");
       return res.redirect(`/listings/${id}`);
     }
     next();
}
