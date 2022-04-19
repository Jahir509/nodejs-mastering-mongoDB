const mongoose = require('mongoose');
const Product = require('../model/product.model');
const Order = require('../model/order.model');
const log = (arg)=>console.log(arg);

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products=>{
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
    });
  })
  .catch(err=>{
    console.log(err);
  })
};


exports.getProductById = (req,res,next)=>{
  const prodId = req.params.productId;

  Product.findById(prodId)
  .then(product=>{
    res.render('shop/product-details',{
      product: product, // product returns an array[]
      pageTitle: product.title,
      path:'/products'
    })
  })
  .catch(err=> console.log(err))  
}

exports.getIndex = (req,res,next)=>{
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop - Index',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  })
  .catch(err=> console.log(err));
  
}


exports.getCart = (req,res,next)=>{
  console.log(req.user.cart)
  req.user
    .populate('cart.items.productId')   
    .then(user => {
      // console.log(user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
}

exports.postCart = (req,res,next)=>{
  const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      //console.log(result);
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result=> {
    // console.log(result);
    res.redirect('/cart');
  })
  .catch(err=> console.log(err));
}

exports.getOrders = (req,res,next)=>{
  req.user.getOrders({include:['products']})
  .then(orders=>{
    // log(orders);
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders:orders
    });
  })
  .catch(err=> log(err))
}

exports.getCheckout = (req,res,next)=>{
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
}

exports.postOrder = (req,res,next)=>{
  req.user
    .populate('cart.items.productId')   
    .then(user => {
      // console.log(user.cart.items);
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc }
        }
      });
      //console.log(products);
      const order = new Order({
        user: {
          name: req.user.name,
          userId:req.user
        },
        products: products
      });
      //console.log(order);
      return order.save();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err=>console.log(err));
}


