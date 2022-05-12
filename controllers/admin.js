const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
const Product = require('../model/product.model');
const {validationResult} = require('express-validator');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing:false,
    hasError: false,
    errorMessage:null,
    validationErrors: []
  });
};

// Adding a product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const error = validationResult(req);
  // console.log(req.user);
  if(!error.isEmpty()){
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      editing:false,
      product: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
      },
      errorMessage: error.array()[0].msg,
      validationErrors: error.array()
    });
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  })
  console.log(product);
  product.save()
  .then(result=> {
    //console.log(result);
    console.log('Product Created');
    res.redirect('/products')
  })
  .catch(err=> console.log(err))

};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
  .then(products=>{
    //console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
    });
  })
  .catch(err=>{
    console.log(err);
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;  // for query param : req.query
  if(!editMode){
    console.log(editMode)
    return res.redirect('/');
  }
  const prodId = req.params.productId   // for dynamic param : req.params
 
  Product.findById(prodId).then(product=>{
    if(!product){
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing:true,
      product:product,
      hasError:false,
      errorMessage:null,
      validationErrors: []
    });
  })
  .catch(err=> {
    console.log(err)
  })
};


exports.postEditProduct = (req,res,next)=>{
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const error = validationResult(req);
  // console.log(req.user);
  console.log(error)
  if(!error.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      editing:true,
      hasError:true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        description: updatedDescription,
        price:updatedPrice,
        _id: productId
      },
      errorMessage: error.array()[0].msg,
      validationErrors: error.array()
    });
  }
  Product.findById(productId)
  .then(product=>{
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/')
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDescription;
    return product.save()
        .then(result=>{
          // this then() block is for successfull operation
          console.log('Product has been Updated')
          res.redirect('/admin/products');
        });  // update the existing one
  })
  .catch(err=> console.log(err))
};

exports.deleteProduct = (req,res,next)=>{
  const productId = req.body.productId;
  Product.deleteOne({_id:productId,userId:req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
  // Product.destroy({where: {id:productId}}).then.catch();
}