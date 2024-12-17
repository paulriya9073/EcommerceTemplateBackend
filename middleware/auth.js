const User=require("../models/User")
const jwt=require("jsonwebtoken");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");

exports.isAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    
        const {token}=req.cookies;

        if(!token){
          return next(new ErrorHandler("Please login first",401))
        }

        const decoded= await jwt.verify(token,process.env.JWT_SECRET);

        req.user = await User.findById(decoded._id);

        next();
  
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };