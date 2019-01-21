// import INSTALLED MODULES======================================
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')
const uniqid = require('uniqid')

// import FILE MODULES===========================================
const errorController = require('./controllers/error');
const User = require('./models/user');

// import ROUTES================================================
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


// app SETUP=========================================================
const MONGODB_URI = "mongodb://localhost:27017/nodecomplete"

// express
const app = express();

// set VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

// setup body-parser
app.use(bodyParser.urlencoded({
  extended: false
}));


// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

// set up session store
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// multer file - filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/jpeg') {
        cb(null,true)
  } else {
    cb(null, false) // this means multer should not accept the file
  }
}

// file storage config
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images',)
  },
  filename: (req, file, cb) => {
      cb(null, uniqid()+ '-' +  file.originalname)
  }
})
// initialize multer
app.use(multer({storage: fileStorage, fileFilter:fileFilter}).single('image'))

// initialize session store
app.use(session({
  secret: 'my secret key',
  resave: false, // stop session from changing on every response
  saveUninitialized: false, // stop session from saving on every request if nothing changes
  store: store
}))

// set up csrf protection and initialize csrfProtectio  it most come after the session
const csrfProtection = csrf()
app.use(csrfProtection)

// initialize flash - it most be done after session
app.use(flash())


// save user to request
app.use((req, res, next) => {
  if(!req.session.user) {
    return next() // return next so the code after will not be executed
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next()
      }
      req.user = user
      next()
    })
    .catch(err => {
      next(new Error(err))
    });
})

// pass global information to pages
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  res.locals.name = req.session.isLoggedIn ? req.session.user.name : null
  next()
}) 

// ROUTES===========================================================
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500',errorController.get500);
app.use(errorController.get404);

// ERROR HANDLER ===================================================
app.use((error, req, res, next)=>{
  // res.status(error.httpStatusCode).render(...)
  res.status(500).render('500', {
    pageTitle: 'Something went wrong!',
    path: '/500',
  });
})

// connect to DATABASE ==============================================
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(() => {
    app.listen(3000, () => console.log('server started at port 3000'));
  })
  .catch(err => console.log(err))
