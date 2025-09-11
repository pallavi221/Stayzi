  const Listing=require("../models/listing.js");
  const mbxGeocoding =require('@mapbox/mapbox-sdk/services/geocoding');
  const mapToken=process.env.MAP_TOKEN;
  const geocodingClient = mbxGeocoding({ accessToken:mapToken });

  module.exports.index= async (req,res)=>{
        const allListings  = await Listing.find({})
               res.render("listings/index.ejs",{allListings});
  };

  module.exports.renderNewForm=(req,res)=>{
      console.log(req.user);
      res.render("listings/new");
    };


module.exports.showListing=async (req,res)=>{
            let {id}=req.params;
            const listing= await Listing.findById(id).populate("owner").populate({path:"reviews",populate:{path:"author"}});
            if(!listing){
               req.flash("error","Listing you just requested does not exist");
                return res.redirect("/listings");
            }
            console.log("DEBUG listing",JSON.stringify(listing, null, 2));
            console.log("Owner in listing:", listing.owner);

            res.render("listings/show",{listing,currUser: req.user});
        };

module.exports.createListing = async (req, res, next) => {
  try {
    // Extract listing data
    const { title, description, price, location, country } = req.body.listing;

    // Collect validation errors
    let errors = [];

    if (!title || title.trim() === "") errors.push("Title cannot be empty.");
    if (!description || description.trim() === "") errors.push("Description cannot be empty.");
    if (!price || price <= 0) errors.push("Price must be greater than 0.");
    if (!location || location.trim() === "") errors.push("Location cannot be empty.");
    if (!country || country.trim() === "") errors.push("Country cannot be empty.");

    // If any errors → flash them and re-render new form
    if (errors.length > 0) {
      errors.forEach((err) => req.flash("error", err));
      return res.render("listings/new", {
        messages: req.flash(),
        formData: req.body.listing, // so user doesn't lose input
      });
    }

    // ✅ If validation passes → proceed with geocoding
    let response = await geocodingClient
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
      type: "Point",
      coordinates: response.body.features[0].geometry.coordinates,
    };

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing created");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.render("listings/new", {
      messages: req.flash(),
      formData: req.body.listing,
    });
  }
};


module.exports.renderEditForm=async(req,res,next)=>{
     let {id}=req.params;
        const listing= await Listing.findById(id);
        if(!listing){
               req.flash("error","Listing you just requested does not exist");
                return res.redirect("/listings");
            }
            console.log("Editing listing:", listing);
        let originalImageUrl=listing.image.url;
       originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250")
        res.render("listings/edit",{listing,originalImageUrl});
  };     

  module.exports.updateListing=async(req,res,next)=>{
       let {id}=req.params;
      let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing},{ runValidators: true, new: true });
        
      if(typeof req.file !=="undefined"){
        let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
   await listing.save();
      }
  req.flash("success","Listing updated");
       res.redirect(`/listings/${id}`);
     };

     module.exports.deleteListing=async(req,res,next)=>{
     let {id}=req.params;
     let deletedListing=await Listing.findByIdAndDelete(id);
     if(!deletedListing){
     console.log(deletedListing);
      req.flash("error","Listing not found");
       return res.redirect("/listings");
     }
     req.flash("success","Listing deleted");
     res.redirect("/listings");
  };