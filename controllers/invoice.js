const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Order = require("../models/Order");
const User = require("../models/User");
const Address = require("../models/Address")
const ErrorHandler = require("../utils/errorhandler");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");

// create invoice --admin
exports.createInvoice = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

   
    const existingInvoice = await Invoice.findOne({ orderId: req.params.id });
    if (existingInvoice) {
        return next(new ErrorHandler("Invoice already exists for this order", 400));
    }

   
    const invoice = await Invoice.create({
        orderId: req.params.id,
    });

    res.status(201).json({
        success: true,
        message: "Invoice Created",
        invoice,
    });
});

// get invoice ---admin
exports.getInvoice = catchAsyncErrors(async (req, res, next) => {
    
    const singleInvoice = await Invoice.findOne({ orderId: req.params.id })
        .populate("orderId"); 

   
    if (!singleInvoice) {
        return next(new ErrorHandler("Invoice not found for this order", 404));
    }

    res.status(200).json({
        success: true,
        singleInvoice,
    });
});



