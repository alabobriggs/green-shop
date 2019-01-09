const fs = require('fs')
const path = require('path')

const p = path.join(path.dirname(
    process.mainModule.filename),
    'data',
    'products.json'
)

const getProductFromFile = (callBack) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            // this callback is sued to inform the parent function when it is done reading the file
            callBack([])
        } else {
            callBack(JSON.parse(fileContent))
        }
    })
}

module.exports = class Product {
    // every function created from this will have title attached to it
    constructor(title){
        this.title = title
    }

    save(){
        getProductFromFile(products => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })  
    }

    static fetchAll(callBack){
        getProductFromFile(callBack)
    }
}