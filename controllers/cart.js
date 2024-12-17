const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Product = require("../models/Product");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorhandler");



// add product to cart
exports.addToCart=catchAsyncErrors(async(req,res,next)=>{

    const {quantity}=req.body

    const user=await User.findById(req.user._id)
    const product=await Product.findById(req.params.id)

    if(!user)
        return next(new ErrorHandler('Login first',401))

    if(!product)
        return next(new ErrorHandler('Product not found',404));

    // if the item is already present in cart or not
    const cartItemIndex=user.cart.findIndex((item)=>item.product.toString()===req.params.id)

    if(cartItemIndex>=0)
    {
        user.cart[cartItemIndex].quantity=quantity;
    }
    else{
        user.cart.push(
            {
                product:req.params.id,
                quantity:quantity
            }
        )
    }

    await user.save();

    res.status(200).json({
        success:true,
        message:"Product added to cart",
        cart:user.cart
    })
});

// remove from cart
exports.removeFromCart=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user._id)
    const product=await Product.findById(req.params.id)

    if(!user)
        return next(new ErrorHandler('Login first',401))

    if(!product)
        return next(new ErrorHandler('Product not found',404));

    user.cart=user.cart.filter((item)=>item.product.toString()!==req.params.id)

    await user.save();
    res.status(200).json({
        success: true,
        message: "Product removed from cart",
        cart: user.cart
    });

})

//delete cart
exports.deleteCart = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("User not found. Please login.", 401));
    }
    
    user.cart = [];
    await user.save();

    res.status(200).json({
        success: true,
        message: "Cart has been cleared successfully",
    });
});