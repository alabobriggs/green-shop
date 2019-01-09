const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}))

// app.use('/admin',adminRoutes)
app.use(adminRoutes)

app.use(shopRoutes)

app.use((req,res,next) => {
    res.status(404).res.sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000, ()=> {
    console.log('server started at port 3000')
})