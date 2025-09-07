  const Review =require("../models/review.js");
    const Listing=require("../models/listing.js")


  module.exports.createReview=async(req,res)=>{
      console.log(req.params.id);
     let listing=await Listing.findById(req.params.id);
     const newReview =new Review(req.body.reviews);
       newReview.author = req.user._id;
      console.log(newReview);
     listing.reviews.push(newReview);
  
  
     await newReview.save();
     await listing.save();
     req.flash("success","New Review created");
     res.redirect(`/listings/${listing._id}`);
  };

  module.exports.deleteReview=async(req,res)=>{
  let{id,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  const deleted=await Review.findByIdAndDelete(reviewId);
     console.log("Deleted Review:", deleted)
     req.flash("success","Review deleted");
     res.redirect(`/listings/${id}`);
}