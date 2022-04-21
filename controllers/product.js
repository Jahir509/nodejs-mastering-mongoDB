// const Product = require('../model/product.model')
const Product = require('../model/sequelize-model/product-sq.model');


exports.getAddProduct =  (req, res, next) => {
    res.render('admin/add-product',
     { pageTitle: 'Add Product',
       path: '/admin/add-product',
       formsCSS: true,
       productCSS: true,
       activeAddProduct: true,
       isAuthenticated: req.isLoggedIn
      });
  }

  exports.postAddProduct =  (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
  }


  //  url: 'shop'
exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(([products,fieldData])=>{
        res.render('shop', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
          hasProducts: products.length > 0,
          activeShop: true,
          productCSS: true,
          isAuthenticated: req.isLoggedIn
      });
    })
    .catch(err=>{
      console.log(err);
    })
    
  }