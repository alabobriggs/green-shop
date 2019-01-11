const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const errorController = require('./controllers/error');

// import ROUTES
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// set up VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

// set up STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// set up BODY PARSER
app.use(bodyParser.urlencoded({ extended: false }));

// set up ROUTES and add '/admin' in every admin routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

// enable SEQUELIZE database
sequelize.sync()
    .then(res => {
        // start SERVER
        app.listen(3000, () => {
            console.log('Server running on port 3000')
        });
    })
    .catch(err => {
        console.log(err)
    })


