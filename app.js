const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// const mongoConnect = require('./util/database').mongoConnect;
const app = express();
const MONGODB_URI = 'mongodb://127.0.0.1:27017/node-complete';
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});


app.set('view engine', 'ejs');
app.set('views', 'views/ejs');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


const errorController = require('./controllers/error');
const User = require('./model/user.model');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret:'firefly',
      resave: false,
      saveUninitialized: false,
      store: store
    })
);

// this middleware for get the current user data
app.use((req,res,next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err=>console.log(err));
});

app.use(authRoutes);
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