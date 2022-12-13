const mongoose =require("mongoose");

const connection =mongoose.connect("mongodb+srv://shivamgupta8482:shivamgupta8482@cluster0.esstzzf.mongodb.net/?retryWrites=true&w=majority")

module.exports=connection;