const Razorpay =require("razorpay");
const crypto = require("crypto");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const User = require("../models/User");
const Address = require("../models/Address");
const Order = require("../models/Order");

const razorpayInstance= new Razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_SECRET_KEY,
})

// send ammount
exports.sendAmountForPayment=catchAsyncErrors(async(req,res,next)=>{

    const {amount} =req.body

    const amountInPaise = Math.round(Number(amount) * 100);

    const options={
        amount:amountInPaise,
        currency:"INR",
        receipt:crypto.randomBytes(10).toString("hex")
    }

    razorpayInstance.orders.create(options,(error,order)=>{
        if(error)
        {
            console.log(error);
            return next(new ErrorHandler("Something went wrong!",500))
        }
        res.status(200).json({
            data:order
        })
    })
})

// make payment and create order
exports.verifyPaymentAndCreateOrder = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const address = await Address.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("Login first!", 401));
    }
    if (!address) {
        return next(new ErrorHandler("Address not found", 404));
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, total, shippingCharges, discount, totalAmount,orderItems, shippingStatus } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(sign.toString()).digest("hex");

const isAuthentic=expectedSign === razorpay_signature

    if (isAuthentic) {
        try {
            const order = await Order.create({
                deliveryAddress: req.params.id,
                user: req.user._id,
                orderItems,
                paymentInfo: {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                },
                total,
                shippingCharges,
                discount,
                totalAmount,
                shippingStatus: "Processing"
            });

            user.orders.push(order._id);
            await user.save();

            res.status(200).json({
                success: true,
                message: "Payment verified and order created successfully!",
                order,
            });
        } catch (orderCreationError) {
            console.error("Error creating order:", orderCreationError);
            return next(new ErrorHandler("Failed to create order", 500));
        }
    } else {
        return next(new ErrorHandler("Invalid Payment Signature", 400));
    }
});