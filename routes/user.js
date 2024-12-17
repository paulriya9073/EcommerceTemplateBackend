const express=require("express");
const { register, login, logout, myProfile, updateProfile, updatePassword,forgetPassword, resetPassword, getAllUser, getSingleUser, deleteUser, updateUserRole, deleteUserAdmin } = require("../controllers/user");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

// for users
const router=express.Router();

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").get(logout)

router.route("/myprofile").get(isAuthenticated,myProfile)

router.route("/update/profile").put(isAuthenticated,updateProfile)

router.route("/update/password").put(isAuthenticated,updatePassword)

router.route("/forget/password").post(forgetPassword)

router.route("/reset/password/:token").post(resetPassword)

router.route("/delete/:id").delete(isAuthenticated,deleteUser)


//for Admin 

router.route("/admin/users").get(isAuthenticated,authorizeRoles("admin"),getAllUser);

router.route("/admin/user/:id")
.get(isAuthenticated,authorizeRoles("admin"),getSingleUser)
.delete(isAuthenticated,authorizeRoles("admin"),deleteUserAdmin)
.put(isAuthenticated,authorizeRoles("admin"),updateUserRole)


module.exports=router