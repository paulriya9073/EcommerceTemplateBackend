const mongoose = require("mongoose")
const bycrpt=require("bcrypt")
const jwt = require("jsonwebtoken");
const crypto=require("crypto")


const userSchema=new mongoose.Schema({

    username:{
        type:String,
        required:[true,"Please enter your first and last name "],
        maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [2, "Name should have more than 2 characters"],
    },
    
    email:{
        type:String,
        required:[true,"Please enter an email"],
        unique:[true,"Email already exist"]

    },
    phone:{
            type:Number,
            required:[true,"Enter a phone number"],
            unique:[true,"Phone number already exist"]
    },
    password:{
        type:String,
        required:[true,"Enter a strong password"],
        minlength:[6,"Password must be atleast 6 characters"],
        select:false
    },
    gender:{
        type:String,
        enum:["Male","Female","Others"],
       
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
   
    createdAt: {
        type: Date,
        default: Date.now,
      },
    addresses:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address"
        }
    ],
    orders:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
],
cart:[
    {
      product:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Product"
      },
      quantity:{
        type:Number,
        require:true
      }
    }
],

    resetPasswordToken:String,
    resetPasswordExpire:Date,



})

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password=await bycrpt.hash(this.password,10)
    }
    next();
});

userSchema.methods.matchPassword=async function(password){
    return await bycrpt.compare(password,this.password)
};

userSchema.methods.generateToken=function () {
    return jwt.sign({_id:this._id},process.env.JWT_SECRET)
}

//generate reset token and expire token time

userSchema.methods.getResetToken=function(){

    const resetToken=crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire=Date.now()+15*60*1000;

     return resetToken;
}

module.exports=new mongoose.model("User",userSchema);