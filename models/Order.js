const mongoose=require("mongoose")

const orderSchema=new mongoose.Schema({

deliveryAddress:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Address"
},
user:{
    type:mongoose.Schema.Types.ObjectId,
        ref:"User",
},
orderItems: [
    {
      quantity:{
           type:Number,
           require:true
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    
    },
  ],
  paymentInfo: {
    razorpay_order_id: {
      type: String,
      required: true,
  },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
  },

  total:{
    type: Number,
    required: true,
  },
  shippingCharges:{
    type: Number,
    required: true,
    default:0
  },
  discount:{
    type: Number,
    default:0
  },
  totalAmount:{
    type: Number,
    required: true,
  },
  tax:{
    type: Number,
    required: true,
    default:0
  },
  shippingStatus:{
    type:String,
    enum:["Processing","Shipped","Delivered","Canceled"],
    default:"Processing"
  },
  
  deliveredAt:Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports=mongoose.model("Order",orderSchema);