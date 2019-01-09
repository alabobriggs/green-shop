const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const app = express()

// this is used to serve static files to the server
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({
    extended: false
}))

// app.use('/admin',adminRoutes)
app.use('/admin',adminRoutes)

app.use(shopRoutes)

app.use((req,res,next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000, ()=> {
    console.log('server started at port 3000')
})