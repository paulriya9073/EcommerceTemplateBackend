const express=require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { newOrder, getMyOrders, getAllOrders, updateShippingStatus, deleteOrder, getSingleOrder, cancelOrder } = require("../controllers/order");

const router=express.Router();

// user
// router.route("/neworder/:id").post(isAuthenticated,newOrder)

router.route("/myorders").get(isAuthenticated,getMyOrders)

router.route("/order/:id")
.get(isAuthenticated,getSingleOrder)
.delete(isAuthenticated,cancelOrder)


// admin
router.route("/admin/orders").get(isAuthenticated,authorizeRoles("admin"),getAllOrders)

router.route("/admin/order/:id")
.put(isAuthenticated,authorizeRoles("admin"),updateShippingStatus)
.delete(isAuthenticated,authorizeRoles("admin"),deleteOrder)


module.exports=router