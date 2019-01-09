const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const app = express()

// enable template engine
app.set('view engine', 'pug')
app.set('views', 'views')

// this is used to serve static files to the server
app.use(express.static(path.join(__dirname, 'public')))


// enable body parser
app.use(bodyParser.urlencoded({
    extended: false
}))

// routes
app.use('/admin',adminData.routes)
app.use(shopRoutes)


// handle 404 errors
app.use((req,res,next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000, ()=> {
    console.log('server started at port 3000')
})