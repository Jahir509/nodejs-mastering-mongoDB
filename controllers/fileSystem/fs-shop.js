const Product = require('../model/product.model');
const Cart = require('../model/cart.model');


exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
};


exports.getProductById = (req,res,next)=>{
  const prodId = req.params.productId;
  Product.getProductById(prodId,product => {
    res.render('shop/product-details',{
      product: product,
      pageTitle: product.title,
      path:'/products'
    })
  })
  
}

exports.getIndex = (req,res,next)=>{
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop - Index',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
}


exports.getCart = (req,res,next)=>{
  Cart.getCart(cart => {
    Product.fetchAll(products=>{
      const cartProducts = [];
      for(product of products){
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if(cartProductData){
          cartProducts.push({productData:product,qty:cartProductData.qty})
        }
      }
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts
      });
    });
  });
}

exports.postCartDeleteProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  Product.getProductById(prodId,product=>{
    Cart.deleteProduct(prodId,product.price)
  });
  res.redirect('/cart');
}

exports.postCart = (req,res,next)=>{
  const prodId = req.body.productId;
  Product.getProductById(prodId,(product)=>{
    Cart.addProduct(prodId,product.price)
  })
  res.redirect('/cart');
  // res.render('shop/cart', {
  //   pageTitle: 'Your Cart',
  //   path: '/cart',
  // });
}

exports.getOrders = (req,res,next)=>{
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
  });
}

exports.getCheckout = (req,res,next)=>{
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
}


