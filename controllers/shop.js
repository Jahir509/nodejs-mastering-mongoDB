const fs = require('fs');
const config = require('config');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../model/product.model');
const Order = require('../model/order.model');
const PDFDocument = require('pdfkit');
const log = (arg)=>console.log(arg);
const item_per_page = 5;
const stripe = require('stripe')(config.get('STRIPE.CODE_GREEN'));

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  let message = req.flash('error');
  let totalProducts = 0;
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  Product.find()
      .count()
      .then(productCount=>{
        totalProducts = productCount;
        return Product.find()
            .skip((page-1)*item_per_page)
            .limit(item_per_page)
      })
      .then(products=>{
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'Product List',
          path: '/products',
          hasProducts: products.length > 0,
          activeShop: true,
          productCSS: true,
          notificationMessage:message,
          totalProduct:totalProducts,
          hasNextPage: item_per_page * Number(page) < totalProducts,
          hasPreviousPage: Number(page) > 1,
          nextPage: Number(page)+1,
          previousPage: Number(page)-1,
          lastPage: Math.ceil(totalProducts / item_per_page),
          currentPage:Number(page),
        });
      })
      .catch(err=> {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
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
  const page = req.query.page ? req.query.page : 1;
  let message = req.flash('error');
  let totalProducts = 0;
  if(message.length > 0){
      message = message[0];
  }else{
      message = null;
  }
  Product.find()
      .count()
      .then(productCount=>{
        totalProducts = productCount;
        return Product.find()
              .skip((page-1)*item_per_page)
              .limit(item_per_page)
      })
      .then(products=>{
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop - Index',
          path: '/',
          hasProducts: products.length > 0,
          activeShop: true,
          productCSS: true,
          notificationMessage:message,
          totalProduct:totalProducts,
          hasNextPage: item_per_page * Number(page) < totalProducts,
          hasPreviousPage: Number(page) > 1,
          nextPage: Number(page)+1,
          previousPage: Number(page)-1,
          lastPage: Math.ceil(totalProducts / item_per_page),
          currentPage:Number(page),
        });
  })
  .catch(err=> {
    console.log(err)
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
    let total;
    let products;
    req.user
        .populate('cart.items.productId')
        .then(user => {
            // console.log(user.cart.items);
            products = user.cart.items;
            total = 0;
            products.forEach(each => {
                total += (each.productId.price * each.quantity)
            })

            /**
             * Stripe Payment
             * **/

            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p=> {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'usd',
                        quantity: p.quantity
                    };
                }),
                success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
                cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
            });
        })
        .then(session=>{
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products:products,
                totalAmount:total,
                sessionId:session.id
            });
        })
        .catch(err=> {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

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

exports.getInvoice = (req,res,next)=>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
      .then(order=>{
        if(!order){
          return next(new Error('No Order Found'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
          return next(new Error('Unauthorized access'));
        }

        const invoiceName = `${orderId}.pdf`;
        const invoicePath = path.join('data','invoices',invoiceName);
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition','inline; filename= "'+ invoiceName +'"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(24).text('Invoice',{
          underline: true
        })
        pdfDoc.text('---------------------------');
        let total = 0;
        order.products.forEach(x=>{
          total += (x.quantity * x.product.price);
          pdfDoc.text(x.product.title + '-' + x.quantity + ' x '+ '$'+x.product.price)
        });
        pdfDoc.text('---------------------------');

        pdfDoc.fontSize(20).text("Total Price: $" + total);
        pdfDoc.end();
        // this portion is using preLoading Data (Recommended for smaller files)
        // fs.readFile(invoicePath,(err,data)=>{
        //   if(err) {
        //     return next(err);
        //   }
        //   res.setHeader('Content-Type','application/pdf');
        //   // res.setHeader('Content-Disposition','inline; filename= "'+ invoiceName +'"');
        //   res.setHeader('Content-Disposition','attachment; filename= "'+ invoiceName +'"');
        //   res.send(data);
        // })

        // this portion is using streaming Data ( Recommended for bigger file )
        // const file = fs.createReadStream(invoicePath);
        //   res.setHeader('Content-Type','application/pdf');
        //   res.setHeader('Content-Disposition','attachment; filename= "'+ invoiceName +'"');
        //   file.pipe(res);
      })
      .catch(err=>next(err))
};