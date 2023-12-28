const ExpressError=require('./utils/ExpressError')
const {campgroundSchema,reviewSchema}=require('./schemas.js')
const Campground=require('./models/campground')
const Review=require('./models/review')

module.exports.isLoggedIN=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error','You must be signed in first')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo=(req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo=req.session.returnTo
    }
    next()
}

module.exports.campgroundValidation=(req,res,next)=>{
    //in google chrome due to client side validation we will not get error 
    //but if we send request through postman error with no title of price less than 0 it will not show error, so we use Joi to tackle that
    const result=campgroundSchema.validate(req.body)
    if(result.error){
        const mssg=result.error.details.map(el=>el.message).join(',')
        throw new ExpressError(mssg,400)
    }
    else{
        next()
    }
}

//if by postman we send a request manually and to protect the route we will use isAuthor middleware
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You donot have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//similarily we will protect the review route also 
module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params
    const review=await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error','You donot have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.reviewValidation=(req,res,next)=>{
    const result=reviewSchema.validate(req.body)
    if(result.error){
        const mssg=result.error.details.map(el=>el.message).join(',')
        throw new ExpressError(mssg,400)
    }
    else{
        next()
    }
}