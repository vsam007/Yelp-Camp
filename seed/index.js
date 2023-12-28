const mongoose=require('mongoose')
const Campground=require('../models/campground')
const cities=require('./cities')
const {descriptors,places}=require('./seedhelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log("Connection Open!!")
    })
    .catch( err =>{
        console.log("Oh No!!")
        console.log(err)
    })

const seeddb=async()=>{
    await Campground.deleteMany({})
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000)
        const campName=descriptors[Math.floor(Math.random()*descriptors.length)]+','+places[Math.floor(Math.random()*places.length)]
        const ranPrice=Math.floor(Math.random()*20)+10
        const camp=new Campground({
            author:'6582bbc592e7f8cd44c4df9d',
            name:campName,
            price:ranPrice,
            description:'very good camp!must visit!',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            geometry:{
                type: "Point",
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images:[
                {
                url: 'https://res.cloudinary.com/dx7ovscbo/image/upload/v1703322467/yelpcamp/xjg3tuaxbufwul3afjaq.jpg',
                fileName: 'yelpcamp/xjg3tuaxbufwul3afjaq',
                }
            ]
        })
        await camp.save()
    }
}

seeddb()
