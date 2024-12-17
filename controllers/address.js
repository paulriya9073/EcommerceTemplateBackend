const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Address = require("../models/Address");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorhandler");

// create new address for delivery
exports.createNewAddress=catchAsyncErrors(async(req,res,next)=>{

const newAddress={
name:req.body.name,
phone:req.body.phone,
address:req.body.address,
city:req.body.address,
state:req.body.state,
country:req.body.country,
pincode:req.body.pincode,
isDefault:req.body.isDefault || false,
user:req.user._id
}

    const user = await User.findOne(req.user._id);

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    const address=await Address.create(newAddress)

    await user.addresses.push(address._id)
    await user.save()

    res.status(201).json({
        success: true,
        message: "Address created",
        address,
    })
})

// update address
exports.updateAddress=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    let address=await Address.findById(req.params.id)

    if(!address)
        return next(new ErrorHandler("Address not found"),404)

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "Address Updated",
        address
    });
})

// get all delivery address--user
exports.getAllAddresses=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }
    
    const addresses= await Address.find().sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        addresses
    });
})

//get a single address---user
exports.getSingleAddress=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    const address=await Address.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    if(!address)
    {
        return next(new ErrorHandler("Address not found!", 404))
    }

    res.status(201).json({
        success: true,
        address,
    })
})

// delete address 
exports.deleteAddress=catchAsyncErrors(async (req,res,next)=>{

    const addressId=req.params.id

    const address=await Address.findById(addressId)
      
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    if(!address)
        return next(new ErrorHandler("Address not found"),404);

    if(address.user.toString() !== req.user._id.toString()) {     
        return next(new ErrorHandler("Unauthorized to delete address",403));
    }

    user.addresses=user.addresses.filter(id=>id.toString()!==addressId.toString())

    await user.save()

    await Address.deleteOne({_id:addressId})

    res.status(200).json({
        success: true,
        message:"Address deleted!"
    });
})