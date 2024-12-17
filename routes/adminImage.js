const express=require('express');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { uploadSliderImg, getAdminImages, deleteAdminImage, uploadLogo } = require('../controllers/adminImage');


const router=express.Router();

router.route("/admin/upload/sliderimage").post(isAuthenticated,authorizeRoles("admin"),uploadSliderImg)

router.route("/admin/upload/logo").post(isAuthenticated,authorizeRoles("admin"),uploadLogo)

router.route("/images").get(getAdminImages)

router.route("/admin/image/delete").delete(isAuthenticated,authorizeRoles("admin"),deleteAdminImage)

module.exports=router