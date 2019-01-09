const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorController = require('./controllers/error')

const app = express()

// enable template engine
app.set('view engine', 'ejs')
app.set('views', 'views')

// this is used to serve static files to the server
app.use(express.static(path.join(__dirname, 'public')))


// enable body parser
app.use(bodyParser.urlencoded({
    extended: false
}))

// routes
app.use('/admin', adminRoutes)
app.use(shopRoutes)


// handle 404 errors
app.use(errorController.get404)

app.listen(3000, ()=> {
    console.log('server started at port 3000')
})