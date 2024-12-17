const express=require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { createProduct, getAllProducts, updateProduct, deleteProduct, getSingleProductDetails, getAdminProducts, createReview, deleteReview, getAllProductsReviews } = require("../controllers/product");
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

const router=express.Router();

// admin
router.route("/admin/newproduct").post(isAuthenticated,authorizeRoles("admin"),createProduct)

router.route("/admin/products").get(isAuthenticated,authorizeRoles("admin"),getAdminProducts)

router
.route("/admin/product/:id")
.put(isAuthenticated,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticated,authorizeRoles("admin"),deleteProduct)


router.route("/allproducts").get(getAllProducts)

router.route("/product/:id").get(getSingleProductDetails)

// reviews

router.route("/review/:id").put(isAuthenticated,createReview)

router.route("/allreviews").get(isAuthenticated,authorizeRoles('admin'),getAllProductsReviews)

router.route("/delete/review/:id").delete(isAuthenticated,deleteReview)






module.exports=router