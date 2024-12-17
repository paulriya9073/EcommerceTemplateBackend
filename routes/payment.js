const express=require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { sendAmountForPayment, verifyPaymentAndCreateOrder } = require("../controllers/payment");

const router=express.Router();

router.route("/payment/amount").post(isAuthenticated,sendAmountForPayment)

router.route("/payment/verify/:id").post(isAuthenticated,verifyPaymentAndCreateOrder)

module.exports=router