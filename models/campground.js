const mongoose=require('mongoose')
const Review=require('./review')

const imageschema=new mongoose.Schema({
    url:String,
    fileName:String
})

//we here use virtual property by this we don't have to update twice in database rather we just have to update once that is only path
imageschema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const campSchema=new mongoose.Schema({
    images:[imageschema],
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    description:{
        type:String,
        required:true,
        min:10
    },
    location:{
        type:String,
        required:true
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts)

campSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href=/campgrounds/${this._id}>${this.name}</a><strong>`
})

campSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})


const Campground=mongoose.model('Campground',campSchema)

module.exports=Campground