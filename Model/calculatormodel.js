
const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
    
    room:Number,
    userid:String,
    email:String,

    status: { type: String, default: 'Available' }

})

const RoomModel = mongoose.model("room",roomSchema);

module.exports={RoomModel};