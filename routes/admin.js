const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const auth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', auth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', auth,  adminController.postAddProduct);

// /admin/products => GET
router.get('/products', auth,  adminController.getProducts);

// /admin/products/xxxxxx => GET
router.get('/edit-product/:productId',  auth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product',  auth, adminController.postEditProduct);


// // /admin/delete-product => POST
router.post('/delete-product', auth,  adminController.deleteProduct);



module.exports = router;
