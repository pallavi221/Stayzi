//   const Review =require("../models/review.js");
//     const Listing=require("../models/listing.js")


//   module.exports.createReview=async(req,res)=>{
//       console.log(req.params.id);
//      let listing=await Listing.findById(req.params.id);
//      const newReview =new Review(req.body.reviews);
//        newReview.author = req.user._id;
//       console.log(newReview);
//      listing.reviews.push(newReview);
  
  
//      await newReview.save();
//      await listing.save();
//      req.flash("success","New Review created");
//      res.redirect(`/listings/${listing._id}`);
//   };

//   module.exports.deleteReview=async(req,res)=>{
//   let{id,reviewId}=req.params;

//   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//   const deleted=await Review.findByIdAndDelete(reviewId);
//      console.log("Deleted Review:", deleted)
//      req.flash("success","Review deleted");
//      res.redirect(`/listings/${id}`);
// }

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  try {
    // Fetch listing with reviews (so we can re-render the page with existing reviews if validation fails)
    let listing = await Listing.findById(req.params.id).populate("reviews");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const { rating, comment } = req.body.reviews || {};
    const errors = [];

    // ✅ Server-side validation
    if (!rating) errors.push("Please select a star rating.");
    if (!comment || comment.trim() === "") errors.push("Please write a comment.");

    if (errors.length > 0) {
      // ✅ Stay on the same page and display errors
      return res.render("listings/show", {
        listing,
        errors,
        formData: { rating, comment },
        currentUser: req.user // so you can still check if logged-in user can delete reviews
      });
    }

    // ✅ If validation passes, create and save review
    const newReview = new Review({ rating, comment });
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review created");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error creating review:", err);
    req.flash("error", "Something went wrong while creating the review.");
    res.redirect(`/listings/${req.params.id}`);
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const deleted = await Review.findByIdAndDelete(reviewId);

    console.log("Deleted Review:", deleted);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error deleting review:", err);
    req.flash("error", "Something went wrong while deleting the review.");
    res.redirect(`/listings/${req.params.id}`);
  }
};
