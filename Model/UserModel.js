const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userId:Number,
    name:String,
    email:String,
    password:String,
    role: { type: String, default: 'user' }

})

const UserModel = mongoose.model("user",userSchema);

module.exports={UserModel};