const db = require('../util/database')

const Cart = require('./cart');

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return  db.execute('INSERT INTo products (title, price, imageUrl,description) VALUES (?,?,?,?)',
      [this.title, , this.price, this.imageUrl, this.description])

    // the array has to be in the same other you put the values
  }

  static deleteById() {
    
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products')
  }

  static findById(id) {
   
  }
};
