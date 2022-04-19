const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// const mongoConnect = require('./util/database').mongoConnect;
const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views/ejs');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const User = require('./model/user.model');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// this middleware for get the current user data
app.use((req,res,next) => {
    User.findById("625e874ce6894762e365e499")
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err=>console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() =>{
//   app.listen(3000);
// })

mongoose
  .connect(
    'mongodb://127.0.0.1:27017/node-complete?retryWrites=true'
  )
  .then(result => {
    User.findOne()
    .then(userData=>{
      if(!userData){
        const user = new User({
          name:'Jahir',
          email:'jahir@gmail.com',
          cart:{
            items: []
          }
        })
        user.save();
      }
    })
    
    app.listen(3000);
    console.log('DB is Connected')
  })
  .catch(err => {
    console.log(err);
  });