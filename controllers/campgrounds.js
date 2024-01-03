const Campground=require('../models/campground')
const {cloudinary}=require('../cloudinary')
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN
const geocoder=mbxGeocoding({accessToken:mapBoxToken})

module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewCamp=(req,res)=>{
    res.render('campgrounds/new')
}

module.exports.newCamp=async(req,res,next)=>{
    // if(req.body.Campground) throw new ExpressError('Invalid Campground Data',400)
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()

    const ncampground=new Campground(req.body.campground) //here in campground our data was grouped
    ncampground.geometry=geoData.body.features[0].geometry
    ncampground.images=req.files.map(f=>({url:f.path,fileName:f.filename}))
    ncampground.author=req.user._id
    await ncampground.save()
    console.log(ncampground)
    req.flash('success','Successfully made a new campground')
    res.redirect(`/campgrounds/${ncampground._id}`)
}

module.exports.renderUpdate=async(req,res)=>{
    const {id}=req.params
    const foundCamp=await Campground.findById(id)
    if(!foundCamp){
        req.flash('error','Cannot find that Campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',{foundCamp})
}

module.exports.updateCamp=async(req,res)=>{
    const {id}=req.params
    console.log(req.body)
    const foundCamp=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs=req.files.map(f=>({url:f.path,fileName:f.filename})) //first making new array of images
    foundCamp.images.push(...imgs) //then adding imgs in current array with help of spread operator
    if(req.body.deleteImg){
        for(let fn of req.body.deleteImg){
            await cloudinary.uploader.destroy(fn)  //fn signifies individual filename
        }
        await foundCamp.updateOne({$pull:{images:{fileName:{$in:req.body.deleteImg}}}})
    }
    await foundCamp.save()
    req.flash('success','Successfully updated')
    res.redirect(`/campgrounds/${foundCamp._id}`)
}

module.exports.deleteCamp=async(req,res)=>{
    const {id}=req.params
    const foundCamp=await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted')
    res.redirect('/campgrounds')
}

module.exports.getCamp=async(req,res)=>{
    const {id}=req.params
    const camp=await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'    //this is review author
        }
    }).populate('author')     //this is our campground author
    if(!camp){
        req.flash('error','Campground Not Found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/details',{camp})
}
