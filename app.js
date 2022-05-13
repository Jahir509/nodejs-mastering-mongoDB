const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
// this is for instant error message
const flash = require('connect-flash');

// const mongoConnect = require('./util/database').mongoConnect;
const app = express();
const MONGODB_URI = 'mongodb://127.0.0.1:27017/node-complete';

// adding session collection for every user
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

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


// CSRF Protection
app.use(csrfProtection);
// Always need to add after session
app.use(flash());

app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})


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

app.get('/500',errorController.get500);

app.use(errorController.get404);
// centralize error handling
// mongoConnect(() =>{
//   app.listen(3000);
// })
app.use((error,req,res,next)=>{
    res.redirect('/500');
});
mongoose
  .connect(
    'mongodb://127.0.0.1:27017/node-complete?retryWrites=true'
  )
  .then(result => {
    app.listen(3000);
    console.log('DB is Connected')
  })
  .catch(err => {
    console.log(err);
  });