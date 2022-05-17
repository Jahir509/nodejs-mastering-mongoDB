const path = require('path');
const {body} = require('express-validator')

const express = require('express');

const adminController = require('../controllers/admin');

const auth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', auth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product',
    [
        body('title').isString().isLength({min:3}).trim(),
        // body('imageUrl').isURL(),
        body('price').isFloat(),
        body('description').trim().isLength({min:5,max:400}),
    ],
    auth,
    adminController.postAddProduct);

// /admin/products => GET
router.get('/products', auth,  adminController.getProducts);

// /admin/products/xxxxxx => GET
router.get('/edit-product/:productId',  auth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product',
    [
        body('title').isString().isLength({min:3}).trim(),
        // body('imageUrl').trim().isURL(),
        body('price').isFloat(),
        body('description').trim().isLength({min:5,max:400}),
    ],
    auth,
    adminController.postEditProduct);


// // /admin/delete-product => POST
router.post('/delete-product', auth,  adminController.deleteProduct);
// router.delete('/product/:productId', auth,  adminController.deleteProduct);


module.exports = router;
