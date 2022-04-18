//const products = [];

// save products in file
const fs = require('fs');
const path = require('path');
const filePath = path.join(path.dirname(process.mainModule.filename),'data','products.json');
const Cart = require('../cart.model');


const getProductsFromFile = cb => {
    fs.readFile(filePath,(err,fileContent)=>{
        if(err){
            cb([]);
        }
        else{
            cb(JSON.parse(fileContent));
        }
    })
}



module.exports = class Product{
    constructor(id,title,imageUrl,description,price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        getProductsFromFile(products =>{
            if(this.id){
                // console.log(this.id)
                const existingProductIndex = products.findIndex(product => product.id === this.id);
                // console.log(existingProductIndex)
                const updatedProducts = [...products];
                // console.log(this);
                updatedProducts[existingProductIndex] = this;
                // console.log(updatedProducts[existingProductIndex]);
                fs.writeFile(filePath,JSON.stringify(updatedProducts),(err)=>{
                    console.log(err);
                })
            }
            else{
                this.id = Math.random().toString();
                products.push(this)
                fs.writeFile(filePath,JSON.stringify(products),(err)=>{
                    console.log(err);
                })
            }
        })
        
            
    }

    static deleteById(id){
        getProductsFromFile(products=>{
            const product = products.find(prod => prod.id === id);
            const updatedProduct = products.filter(x => x.id !== id);
            fs.writeFile(filePath,JSON.stringify(updatedProduct),err=>{
                if(!err){
                    Cart.deleteProduct(id,product.price);
                }
            })
        });
    }

    static fetchAll(cb){
        getProductsFromFile(cb);
    }

    static getProductById(id,cb){
        getProductsFromFile(products=>{
            const product = products.find(x => x.id === id)
            cb(product)
        });
    }
}