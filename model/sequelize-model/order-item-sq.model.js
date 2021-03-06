const Sequelize = require('sequelize');
const sequelize = require('../../util/sequelize');

const OrderItem = sequelize.define('orderItem',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,

    },
    quantity: {
        type: Sequelize.INTEGER
    }
})


module.exports = OrderItem;