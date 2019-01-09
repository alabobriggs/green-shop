const products = []

module.exports = class Product {
    constructor(title){
        this.title = title
    }

    save(){
        // *this pushes this which is the constructor funtionwithe all its constructors into the product array
        products.push(this)
        console.log(this.title)
        console.log(products)
    }

    static fetchAll(){
        return products
    }
}