const Sequelize = require('sequelize');
const sequelize = require('../../util/sequelize');

// Creating Product Model goto docs.sequelize site for details
const Product = sequelize.define('product',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title:{
        type:Sequelize.STRING,
        allowNull:false
    },
    price:{
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    imageUrl:{
        type: Sequelize.STRING,
        allowNull: false
    },
    description:{
        type: Sequelize.TEXT,
        allowNull: false
    }
})

module.exports = Product;