const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URl = "mongodb://localhost:27017/nodecomplete"

const app = express();
const store = new mongoDbStore({
  url: MONGODB_URl,
  collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({
   extended: false 
  }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret : 'my secret key',
  resave: false, // stop session from changing on every response
  saveUninitialized: false, // stop session from saving on every request if nothing changes
  store: store
}))

app.use((req, res, next) => {
  User.findById('5c3dae943b8b220aecd18018')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URl, {
    useNewUrlParser: true
  })
  .then(() => {
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
