const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb;


class Product{
    constructor(title,imageUrl,description,price,id){
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this._id = id;

    }

    save(){
        const db = getDb();

        return db.collection('products')
        .insertOne(this)
        .then(result=>{
            console.log(result);
        })
        .catch(err=>  {
            console.log(err);
        })
        
    }

    static deleteById(id){
        
    }

    static fetchAll(){
        const db = getDb();

        return db.collection('products')
        .find()
        .toArray()
        .then(products=>{
            console.log(products);
            return products;
        })
        .catch(err=> console.log(err));
    }

    static getProductById(id){
        const db = getDb();
        return db.collection('products')
        .find({_id: new mongoDb.ObjectId(id)})
        .next()
        .then(product=>{
            console.log(product);
            return product;
        })
        .catch(err=> console.log(err));
    }
}

module.exports = Product;