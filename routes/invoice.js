const express=require('express');
const { isAuthenticated } = require('../middleware/auth');
const { createInvoice, getInvoice } = require('../controllers/invoice');

const router=express.Router();

router.route('/invoice/:id')
.post(isAuthenticated,createInvoice)
.get(isAuthenticated,getInvoice)

module.exports=router