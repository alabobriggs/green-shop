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
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs = require('fs')
const https = require('https')

// import FILE MODULES===========================================
const errorController = require('./controllers/error');
const User = require('./models/user');

// import ROUTES================================================
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


// app SETUP=========================================================
const MONGODB_URI = process.env.MONGODB_URI
// console.log(process.env.MONGODB_URI)
// console.log(process.env.SENDGRID_KEY)
// console.log(process.env.STRIPE_KEY)
// console.log(process.env.NODE_ENV) 

// express
const app = express();

// secure headers 
app.use(helmet())

// file compression
app.use(compression())

// setup https
const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('-server.cert')

// morgan file logger 
const accessLogStream = fs.createWriteStream(
      path.join(__dirname,'access.log'), 
      {
        flags: 'a'
      }
    )
app.use(morgan('combined', {stream: accessLogStream}))

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

const csrfProtection = csrf()

// initialize flash - it most be done after session
app.use(flash())
app.use(csrfProtection)
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
  res.locals.name = req.session.isLoggedIn ? req.session.user.name : null
  next()
}) 

// ROUTES===========================================================
app.post('/create-order', isAuth, shopController.postOrder);

// set up csrf protection and initialize csrfProtectio  it most come after the session
app.use(csrfProtection)

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
}) 

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500',errorController.get500);
app.use(errorController.get404);

// ERROR HANDLER ===================================================
app.use((error, req, res, next)=>{
  // res.status(error.httpStatusCode).render(...)
  // console.log(error)
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
      // https
      // .createServer(
      //   { key: privateKey, cert: certificate}, app
      // )
      app.listen(
        process.env.PORT || 3000, 
        () => console.log('server started at port 3000')
      );
  })
  .catch(err => console.log(err))
