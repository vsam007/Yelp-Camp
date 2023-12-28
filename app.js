if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const override=require('method-override')
const ExpressError=require('./utils/ExpressError')
const ejsMate=require('ejs-mate')
const Joi=require('joi')
const campground_route=require('./routes/campground')
const review_route=require('./routes/review')
const user_route=require('./routes/user')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const localStratergy=require('passport-local')
const User=require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const mongoDBStore=require('connect-mongo')(session)

const dbUrl='mongodb://127.0.0.1:27017/yelp-camp'


mongoose.connect(dbUrl)
    .then(()=>{
        console.log("Connection Open!!")
    })
    .catch( err =>{
        console.log("Oh No!!")
        console.log(err)
    })


app.engine('ejs',ejsMate)

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(override('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())                  //mongoSanitize helps to avoid query injection(for safety purpose)

const store=new mongoDBStore({
    url: dbUrl,
    secret:'iamironman',
    touchAfter:24*60*60
})

const sessionConfig={
    store,
    secret:'IamIronman',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+ 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStratergy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser=req.user      //this is used for storing user info and thn using to display login/logout
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

app.use('/',user_route)
app.use('/campgrounds',campground_route)
app.use('/campgrounds/:id/reviews',review_route)

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/fakeUser',async(req,res)=>{
    const newUser=new User({email:'jvaibhav6921@gmail.com',username:'vai007'})
    const obj=await User.register(newUser,'monkey')
    res.send(obj)
})

app.all('*',(req,res,next)=>{
    //html error if page not found
    next(new ExpressError('Page not found',404))
})



app.use((err,req,res,next)=>{
    const {status=500}=err
    if(!err.message)    err.message="Oh no something went wrong!"
    res.status(status).render('error',{err})  //this is mongoose error
})

app.listen(3000,(req,res)=>{
    console.log('Listening on Port 3000')
})
