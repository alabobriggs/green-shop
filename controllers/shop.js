const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs')
const path = require('path')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {

      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product.findById(prodId) // findByID is a mongoose method
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId') // .then() won't work because it doesn't return a promise
    .execPopulate() // execPopulate returns a promise
    .then(user => {
      products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product)
          })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
          const error = new Error(err)
          error.httpStatusCode = 500
          return next(error)
        });
  
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items.map(i => {
        return {quantity: i.quantity , product: {...i.productId._doc}}
      })
      const order = new Order({
        user : {
          name : req.user.name,
          userId : req.user._id
        }, 
        products : products
      })
      return order.save()
    })
    .then(() => {
      return req.user.clearCart()
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order
    .find({'user.userId': req.user})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};


exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found'))
      }
      if(order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorised'))
      }
      const invoiceName = 'invoice-' + orderId + '.pdf'
      const invoicePath = path.join('data', 'invoices', invoiceName)
     
      const file = fs.createReadStream(invoicePath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'content-disposition',
        'inline; filename="' + invoiceName + '"'
      )
      file.pipe(res)
    })
    .catch(err => {
      return next(error)
    });
  
}