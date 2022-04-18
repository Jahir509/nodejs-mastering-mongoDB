const Product = require('../model/product.model');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing:false,

  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null,title,imageUrl,description,price);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;  // for query param : req.query
  if(!editMode){
    console.log(editMode)
    return res.redirect('/');
  }
  const prodId = req.params.productId   // for dynamic param : req.params
 
  Product.getProductById(prodId,product=>{
    if(!product){
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing:true,
      product:product
    });
  })
};


exports.postEditProduct = (req,res,next)=>{
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedProduct = new Product(
    productId,
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice
    );
  //console.log(updatedProduct);
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.deleteProduct = (req,res,next)=>{
  const productId = req.body.productId;
  Product.deleteById(productId);
  res.redirect('/admin/products');
}