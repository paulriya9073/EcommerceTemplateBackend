const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendEmail } = require("../middleware/sendMail");
const User = require("../models/User")
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorhandler");

// register a user
exports.register =catchAsyncErrors( async (req, res,next) => {
    
        const {username, email, password,phone,gender } = req.body;
        let user = await User.findOne({ email })
        if (user) {
            return next(new ErrorHandler("User already exist",400))
        }
        user = await User.create({
          username,
            email,
            password,
            phone,
            gender,
        });

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token,
        });
});

// login user
exports.login =catchAsyncErrors( async (req, res,next) => {
 
        const { email,phone, password } = req.body
        
        const isEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const query=isEmail? {email}:{phone}

        const user = await User.findOne( query )
            .select("+password")
       
        if (!user) {
            return next(new ErrorHandler("User doesn't exist",404))
        }

        const ismatch = await user.matchPassword(password)

        if (!ismatch) {
            return next(new ErrorHandler("Wrong pasword",401))
        };

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
            success: true,
            message:"Logged in",
            token,
            user,
        });
});

// logout user
exports.logout = catchAsyncErrors(async (req, res) => {
   
        res
            .status(200)
            .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
            .json({
                success: true,
                message: "Logged Out"
            });
});

// update user profile
exports.updateProfile =catchAsyncErrors( async (req, res,next) => {
   
        const user = await User.findById(req.user._id)

        const { username, email,phone,gender } = req.body

        if (username) {
            user.username = username;
        }
        if (email) {
            user.email = email;
        }
        if(phone){
            user.phone=phone
        }
        if(gender)
        {
            user.gender=gender
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated",
            user,
        });
});

// update user password
exports.updatePassword =catchAsyncErrors( async (req, res,next) => {

        const user = await User.findById(req.user._id).select("+password")

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword)
         {
           return next(new ErrorHandler("Please enter Old Password and New Password",400))
        }

        const isMatch = await user.matchPassword(oldPassword);

        if (isMatch) {

            user.password = newPassword;

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password Updated!"
            })
        }
        return next(new ErrorHandler("Old password is incorrect", 400));
});

// forgot password
 exports.forgetPassword=catchAsyncErrors(async(req,res,next)=>{
    
    
        const {email}=req.body;
    
        const user=await User.findOne({email})
    
        if(!user){
            return next(new ErrorHandler("User not found",404))
        }
    
        // get reserpassword token
        const resetPasswordToken=await user.getResetToken()
    
        await user.save();
        
        const resetUrl = `${req.protocol}://localhost:5173/account/reset/password/${resetPasswordToken}`;
    
        const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

        console.log(message);
    
        try {
            await sendEmail({
              email: user.email,
              subject: "Reset Password",
              message,
            });
      
            res.status(200).json({
              success: true,
              message: `Email sent to ${user.email}`,
            });
          } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
      
            res.status(500).json({
              success: false,
              message: error.message,
            });
          }
    });
    
    // reset password
    exports.resetPassword=catchAsyncErrors(async (req,res,next)=>{
       
            const resetPasswordToken = crypto
              .createHash("sha256")
              .update(req.params.token)
              .digest("hex");
        
            const user = await User.findOne({
              resetPasswordToken,
              resetPasswordExpire: { $gt: Date.now() },
            });
        
            if (!user) {
                return next(new ErrorHandler(
                      "Reset Password Token is invalid or has been expired",
                      400));
            }
        
            user.password = req.body.password;
        
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        
            res.status(200).json({
              success: true,
              message: "Password Reset Successfully",
            });
    });

     // for user profile ---my profile
exports.myProfile =catchAsyncErrors( async (req, res) => {

        const user = await User.findById(req.user._id)
        .populate("addresses")
        .populate("orders")
        .populate({
          path:"cart.product",
          model:"Product",
        })
     
        res.status(200).json({
            success: true,
            user,
        });
  });

// get all users--admin
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
  
    const users=await User.find()

    const numberOfUsers=await User.countDocuments()
    
  res.status(200).json({
    success: true,
    users,
    numberOfUsers,
  });
});

// Get single user---admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const singleUser = await User.findById(req.params.id).populate("addresses")
  
    if (!singleUser) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      singleUser,
    });
  });

  // update user role---admin
  exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{

    
   const user= await User.findById(req.params.id)

   const {role}=req.body

    if(role)
    {
      user.role=role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message:"Role Updated",
    });
  })

//   delete user---user
  exports.deleteUser =catchAsyncErrors( async (req, res,next) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
      }
  
         // Logout user after deleting profile
         await user.deleteOne({ id: user._id });

         res.cookie("token", null, {
             expires: new Date(Date.now()),
             httpOnly: true,
         });
 
         res.status(200).json({
             success: true,
             message: "Profile Deleted",
             user
         });
 });

// delete account---admin
exports.deleteUserAdmin =catchAsyncErrors( async (req, res,next) => {

  const user = await User.findById(req.params.id);

  if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }

       // Logout user after deleting profile
       await user.deleteOne({ id: user._id });

       res.status(200).json({
           success: true,
           message: "Profile Deleted",
       });
});

    
    