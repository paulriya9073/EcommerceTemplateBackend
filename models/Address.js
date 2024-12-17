const mongoose=require("mongoose")

const addressSchema=new mongoose.Schema({

    name:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
    },
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
 },
 createdAt: {
  type: Date,
  default: Date.now,
},


})
module.exports=new mongoose.model("Address",addressSchema);