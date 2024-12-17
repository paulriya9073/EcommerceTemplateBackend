const mongoose=require('mongoose')

const invoiceSchema=mongoose.Schema({
    
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
            ref:"Order"
    },
   
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

module.exports=mongoose.model("Invoice",invoiceSchema)