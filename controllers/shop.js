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
        productCSS: true,
    });
  })
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};


exports.getProductById = (req,res,next)=>{
  const prodId = req.params.productId;

  Product.findById(prodId)
  .then(product=>{
    res.render('shop/product-details',{
      product: product, // product returns an array[]
      pageTitle: product.title,
      path:'/products',
    })
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
}

exports.getIndex = (req,res,next)=>{
  let message = req.flash('error');
  if(message.length > 0){
      message = message[0];
  }else{
      message = null;
  }
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop - Index',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
      notificationMessage:message
    });
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
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
        products: products,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postCartDeleteProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result=> {
    // console.log(result);
    res.redirect('/cart');
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getOrders = (req,res,next)=>{
  Order.find({"user.userId": req.user._id})
  .then(orders=>{
    //log(orders);
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders:orders,
    });
  })
  .catch(err=> {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
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
          email: req.user.email,
          userId:req.user
        },
        products: products
      });
      //console.log(order);
      return order.save();
    })
    .then(result => {
      req.user.clearFromCart();
    })
    .then(()=>{
      res.redirect('/orders');
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


