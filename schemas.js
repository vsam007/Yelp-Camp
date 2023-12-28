const Joi=require('joi')

module.exports.campgroundSchema=Joi.object({
    campground: Joi.object({
        name:Joi.string().required(),
        price:Joi.number().required(),
        description:Joi.required(),
        location:Joi.string().required(),
        //image:Joi.string().required()
    }).required(),
    deleteImg: Joi.array()
})
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required(),
        body:Joi.string().required()
    }).required()
})