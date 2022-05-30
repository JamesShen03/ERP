var express = require ("express"),
    mongoose=require("mongoose"),
    app = express(),
    bodyParser=require("body-parser"),
    methodOverride = require("method-override"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    User=require("./models/user");
    
mongoose.set("useFindAndModify", false);
mongoose.connect('mongodb://localhost:27017/studio_vivian', { useNewUrlParser: true }); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

app.use(require("express-session")({
    secret: "thisisthesecretofthestudio",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});


    
// show login form
app.get("/", function(req, res){
   res.render("login"); 
});


// handling login logic
app.post("/", passport.authenticate("local", 
    {
        successRedirect: "/main",
        failureRedirect: "/"
    }), function(req, res){
});


app.get("/main",isLoggedIn, function(req,res){
   
   if(res.locals.currentUser.activation==="zero"){
       res.redirect("/infoquery");

   }
   else
    res.render("main");
});

app.get("/infoquery", isLoggedIn, function(req, res){
   res.render("infoquery"); 
   
});

app.put("/infoquery", isLoggedIn, function(req, res){
    var id=res.locals.currentUser._id;
    console.log (id);
    
    var newData = {activation: "one",
           
            address:req.body.address,
            favorite: req.body.favorite,
            gender: req.body.gender,
            age: req.body.age};
            
    // User.findOneAndUpdate(
    //     { "_id" : "id" },
    //     { $set: newData}
    // );

    User.findByIdAndUpdate(id, {$set: newData}, function(err, user){ if(err){
            res.redirect("/infoquery");
        } else {
            res.redirect("/main");
        }
            
    });
});


app.get("/activate", isLoggedIn, isAdmin, function(req, res){

   User.find({activation:"one"}, function(err, allUsers){
       if(err){
           console.log(err);
       } else {
          res.render("activate",{users:allUsers});
       }
   });
});

app.put("/activate", isLoggedIn, isAdmin, function(req, res){
    console.log(req.body.approved);
    var newData = {activation: "two"};
    
    User.findByIdAndUpdate(req.body.approved, {$set: newData}, function(err, user){ if(err){
            res.redirect("/main");
        } else {
            res.redirect("/activate");
        }
            
    });
});

//  ===========
// AUTH ROUTES
//  ===========

// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var _functions;
    if(req.body.auth==="teacher"){
        _functions=["My Courses","Invoices","My Students"];
    }
    else{
        _functions=["My Courses","My Teachers","Materials"];
    }
    var _activation="zero";
    // var _address= var _favorite= var _gender=var _age="null";
    var newUser = new User({username: req.body.username, email:req.body.email, auth:req.body.auth, firstname:req.body.firstname, lastname:req.body.lastname,activation:_activation, functions:_functions
    // ,address: _address, favorite:_favorite, gender:_gender, age:_age
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/main"); 
        });
    });
});


// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

function isAdmin(req, res, next){
    if(res.locals.currentUser.activation==="three"){
        return next();
    }
    res.redirect("/main");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING!");
})