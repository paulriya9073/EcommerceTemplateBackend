const express=require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createNewAddress, updateAddress, getAllAddresses, deleteAddress, getSingleAddress } = require("../controllers/address");

const router=express.Router();

router.route("/newaddress").post(isAuthenticated,createNewAddress)

router.route("/address/:id")
.get(isAuthenticated,getSingleAddress)
.put(isAuthenticated,updateAddress)
.delete(isAuthenticated,deleteAddress)

// populated so not needed
router.route("/addresses").get(isAuthenticated,getAllAddresses)  

module.exports=router