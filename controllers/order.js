const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Order = require("../models/Order");
const User = require("../models/User");
const Address=require("../models/Address")
const ErrorHandler = require("../utils/errorhandler");
const Product = require("../models/Product");


// exports.newOrder=catchAsyncErrors(async (req,res,next)=>{

//     const user=await User.findById(req.user._id)

//     const address= await Address.findById(req.params.id)

//     if (!user) {
//         return next(new ErrorHandler("login first!", 401))
//     }
//     if (!address) {
//         return next(new ErrorHandler("address not found", 404))
//     }

//     const {total,tax,shippingCharges,discount,totalAmount,orderItems,shippingStatus}=req.body

//     const order=await Order.create({
//         deliveryAddress:req.params.id,
//         user:req.user._id,
//         orderItems,
//         paymentInfo:{

//         },
//         total,
//         tax,
//         shippingCharges,
//         discount,
//         totalAmount,
//         shippingStatus,
//     })

//     await user.orders.push(order)
//     await user.save()

//     res.status(201).json({
//         success: true,
//         message: "Order created",
//         order
//     });
// });

// get logged in user order
exports.getMyOrders=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user._id)

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    myOrders=await Order.find({user:req.user._id})
    .sort({ createdAt: -1 })
    .populate("deliveryAddress")
    .populate({
        path: 'orderItems.product',
        model: 'Product',
      })

    res.status(201).json({
        success: true,
       myOrders
    });
});

// get all orders---admin
exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{

    const orders=await Order.find()
    .sort({ createdAt: -1 })
    .populate("deliveryAddress")
    .populate(
        "user",
        "username email phone"
    )
    .populate({
        path: 'orderItems.product',
        model: 'Product',
      })


  const totalNoOfOrders= await Order.countDocuments();

      let totalAmountOfAllOrders=0

      orders.forEach((orders)=>{
        totalAmountOfAllOrders+=orders.totalAmount
      })

    res.status(201).json({
        success: true,
       orders,
       totalAmountOfAllOrders,
       totalNoOfOrders

    });
})

// get a single order 
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{

  const user=await User.findById(req.user._id)
  const order=await Order.findById(req.params.id)
  .populate("deliveryAddress")
  .populate({
      path: 'orderItems.product',
      model: 'Product',
    })
    .populate(
        "user",
        "username email phone"
    )

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }
    if(!order)
    {
      return next(new ErrorHandler("Order not found",404))

    }
    res.status(200).json({
      success:true,
      order
    })

})

// update shipping status--admin
exports.updateShippingStatus=catchAsyncErrors(async(req,res,next)=>{

    const {shippingStatus}=req.body

    const order=await Order.findById(req.params.id)

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  order.shippingStatus=shippingStatus

  if(shippingStatus==="Delivered")
  {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
})

// cancel order 
exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {

  // Find the user by ID
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Find the order by ID
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  // Update the order status to 'Canceled'
  order.shippingStatus = "Canceled";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order canceled",
  });
});

// delete order---admin
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{

    const order=await Order.findById(req.params.id)

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    await Order.deleteOne({_id:req.params.id})

    res.status(200).json({
        success: true,
        message:"Order deleted"
      });
})


