const User = require('../models/user');
const bcrypt = require('bcryptjs')
const nodemailer = 

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage : message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({email: email})
    .then(user => {
      if(!user){
        req.flash('error', 'Email does not exist')
        req.session.isLoggedIn = true;
        return res.redirect('/login')
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch){
            req.session.user = user;
            return req.session.save(err => {
              if(err){
                console.log(err)
              }
              res.redirect('/');
            });
          }
          req.flash('error', 'Wrong password')
          res.redirect('/login')
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc){
        req.flash('error', 'Email already in use, please pick a new one')
        return res.redirect('/signup')
      } 
      return bcrypt.hash(password, 12)
              .then(hashedPassword => {
                const user = new User({
                  name: name,
                  email: email,
                  password: hashedPassword,
                  cart: { items: [] }
                })
                return user.save()
              })
                .then(() => {
                  res.redirect('/login')
              })
    })
    .catch(err => {
      console.log(err)
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err)
    }
    res.redirect('/');
  });
};
