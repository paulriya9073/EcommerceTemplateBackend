const mongoose=require('mongoose')

const imageSchema=mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
   logoImg:{
          public_id: {
              type: String,
              
          },
          url: {
              type: String,
              
          }
      },

    sliderImg:[
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ],

        createdAt: {
            type: Date,
            default: Date.now,
          },
 
})

module.exports=mongoose.model("AdminImage",imageSchema)