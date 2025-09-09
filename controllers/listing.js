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

module.exports.createListing=async (req,res,next)=>{

 let response = await geocodingClient.forwardGeocode({
   query: req.body.listing.location,
 limit: 1
 })
 .send();

 
  let url=req.file.path;
  let filename=req.file.filename;

const newListing= new Listing(req.body.listing);
newListing.owner=req.user._id;
newListing.image={url,filename};

newListing.geometry={
  type:"Point",
  coordinates:response.body.features[0].geometry.coordinates
}

let savedListing=await newListing.save();
console.log(savedListing);
req.flash("success","New Listing created");
res.redirect("/listings");
            
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