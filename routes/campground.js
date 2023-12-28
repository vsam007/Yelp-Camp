const express=require('express')
const router=express.Router()
const Campground=require('../models/campground')
const catchAsync=require('../utils/catchAsync')
const campgrounds=require('../controllers/campgrounds')
const {isLoggedIN,isAuthor,campgroundValidation}=require('../middleware')
const {storage}=require('../cloudinary')
const multer=require('multer')
const upload=multer({storage})


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIN,upload.array('image'),campgroundValidation,catchAsync(campgrounds.newCamp))

router.get('/new',isLoggedIN,campgrounds.renderNewCamp)


router.route('/:id')
    .get(catchAsync(campgrounds.getCamp))
    .put(isLoggedIN,isAuthor,upload.array('image'),campgroundValidation,catchAsync(campgrounds.updateCamp))
    .delete(isLoggedIN,isAuthor,catchAsync(campgrounds.deleteCamp))

router.get('/:id/update',isLoggedIN,isAuthor,catchAsync(campgrounds.renderUpdate))


module.exports=router

//we can group routes with same path
// router.route('/:id')
//     .get(catchAsync(campgrounds.getCamp))
//     .put(isLoggedIN,isAuthor,campgroundValidation,catchAsync(campgrounds.updateCamp))
//     .delete(isLoggedIN,isAuthor,catchAsync(campgrounds.deleteCamp))

