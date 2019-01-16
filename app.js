// import INSTALLED MODULES======================================
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


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

// set up session store
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// initialize session store
app.use(session({
  secret: 'my secret key',
  resave: false, // stop session from changing on every response
  saveUninitialized: false, // stop session from saving on every request if nothing changes
  store: store
}))

// save user to request
app.use((req, res, next) => {
  if(!req.session.user) {
    return next() // return next so the code after will not be executed
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => console.log(err));
})

// ROUTES===========================================================
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// connect to DATABASE ==============================================
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(() => {
    // create dummy USER
    User
      .findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: 'Alabo',
            email: 'alabo@test.com',
            cart: {
              items: []
            }
          })
          user.save()
        }
      })
    app.listen(3000, () => console.log('server started at port 3000'));
  })
  .catch(err => console.log(err))
