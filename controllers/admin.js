const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
const Product = require('../model/product.model');
const {validationResult} = require('express-validator');
const fileHelper = require('../util/file');
const item_per_page = 5;

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
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const error = validationResult(req);
  if(!image){
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      editing:false,
      product: {
        title: title,
        description: description,
        price: price,
      },
      errorMessage: 'Provide a valid image (jpg, png, gif)',
      validationErrors: []
    });
  }
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
        description: description,
        price: price,
      },
      errorMessage: error.array()[0].msg,
      validationErrors: error.array()
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  })
  // console.log(product);
  product.save()
  .then(result=> {
    //console.log(result);
    console.log('Product Created');
    res.redirect('/products')
  })
  .catch(err=> {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })

};

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  let totalProducts = 0;
  Product.find({userId:req.user._id})
      .count()
      .then(productCount=>{
        totalProducts = productCount;
        return Product.find({userId:req.user._id})
            .skip((page-1)*item_per_page)
            .limit(item_per_page)
      })
  .then(products=>{
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
        totalProduct:totalProducts,
        hasNextPage: item_per_page * Number(page) < totalProducts,
        hasPreviousPage: Number(page) > 1,
        nextPage: Number(page)+1,
        previousPage: Number(page)-1,
        lastPage: Math.ceil(totalProducts / item_per_page),
        currentPage:Number(page),
    });
  })
  .catch(err=>{
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
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
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};


exports.postEditProduct = (req,res,next)=>{
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;
  const error = validationResult(req);
  // console.log(req.user);
  //console.log(error)
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
    console.log(image);
    if(image){
      fileHelper.deleteFile(product.imageUrl)
      product.imageUrl = image.path;
    }
    product.description = updatedDescription;
    // console.log(product)
    return product.save()
        .then(result=>{
          // this then() block is for successfull operation
          console.log('Product has been Updated')
          res.redirect('/admin/products');
        });  // update the existing one
  })
  .catch(err=> {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.deleteProduct = (req,res,next)=>{
  const productId = req.body.productId;
  Product.findById(productId)
      .then(product=>{
        if(!product){
          return next(new Error('Product Not Found'));
        }
        fileHelper.deleteFile(product.imageUrl)
        return Product.deleteOne({_id:productId,userId:req.user._id});
      })
      .then(() => {
        console.log('DESTROYED PRODUCT');
         res.redirect('/admin/products');
        // res.status(200).json({
        //   message: 'Success!'
        // });
      })
      .catch(err =>{
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        // res.status(500).json({
        //   message: 'Deleting failed!'
        // });
      });
  // Product.destroy({where: {id:productId}}).then.catch();
}