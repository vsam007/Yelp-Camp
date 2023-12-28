const express=require('express')
const router=express.Router({mergeParams:true})   //we used mergeParams because in reviews route i had campground id so to access it,i used mergeParams
const Campground=require('../models/campground')
const Review=require('../models/review')
const ExpressError=require('../utils/ExpressError')
const catchAsync=require('../utils/catchAsync')
const {reviewValidation,isLoggedIN,isReviewAuthor}=require('../middleware')
const reviews=require('../controllers/reviews')

router.post('/',isLoggedIN,reviewValidation,catchAsync(reviews.newReview))

//delete review
router.delete('/:reviewId',isLoggedIN,isReviewAuthor,catchAsync(reviews.deleteRiview))

module.exports=router