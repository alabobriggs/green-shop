const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(image)
  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
    });
  }
  const imageUrl = `/${image.path}`
  const product = new Product({
    title : title, 
    price : price,
    description : description,
    imageUrl : imageUrl, 
    userId: req.user
  });
  
  product
    .save()
    .then(result => {
     
      res.redirect('/admin/products');
    })
    .catch(err => {
      res.redirect('/500')
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        name: req.session.isLoggedIn ? req.session.user.name : null
      });
    })
    .catch(err =>{ 
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  
  Product
    .findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }
      product.title = updatedTitle
      product.price = updatedPrice
      if(image){
        product.imageUrl = `/${image.path}`
      }
      product.description = updatedDesc
      return product.save().then(result => {
        res.redirect('/admin/products');
      }) // save is a mongoose method
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId : req.user._id, })
    // .select('title price -_id') used to control which fields are returned
    // .populate('userId', 'name email -cart') second argument pupulates which fields are needed
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ 
    _id: prodId.toString(), 
    userId: req.user._id.toString() 
  })
    .then(() => {

      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
