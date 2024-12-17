const express=require('express');
const { isAuthenticated } = require('../middleware/auth');
const { addToCart, removeFromCart, deleteCart } = require('../controllers/cart');


const router=express.Router();

router.route('/cart/add/:id').post(isAuthenticated,addToCart)

router.route('/cart/delete/:id').delete(isAuthenticated,removeFromCart)

router.route('/cart/delete').delete(isAuthenticated,deleteCart)


module.exports=router