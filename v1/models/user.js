var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    auth:String,
    firstname:String,
    lastname:String,
    activation: String,
    functions: [String],
    // other:
    address:String,
    favorite: String,
    gender: String,
    age: String
    
    
});

UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);
