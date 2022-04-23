const bcrypt = require('bcrypt');
const User = require('../model/user.model');

exports.login = (req,res,next)=>{

    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
};

exports.postLogin = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
        .then(user=>{
           if(!user)
           {
               return res.redirect('/login')
           }
           bcrypt.compare(password,user.password)
               .then(isTrue=>{
                   if(isTrue){
                       req.session.isLoggedIn = true;
                       req.session.user = user;
                       return req.session.save(result=>{
                           return res.redirect('/');
                       });
                   }
                   res.redirect('/login');
               })
               .catch(err=>{
                   console.log("Hash doesn't match" + err);
                   res.redirect('/login');
               });
        })
        .catch(err=> console.log(err))
};

exports.postLogout = (req,res,next)=> {
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignUp = (req,res,next)=> {
    res.render('auth/signup',{
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    })
};

exports.postSignUp = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({email: email})
        .then(userData=>{
            if(userData)
            {
                return res.redirect('/signup')
            }
          return bcrypt.hash(req.body.password,12)
              .then(hashedPassword=>{
                  const user = new User({
                      email:email,
                      password: hashedPassword,
                      cart: {items:[]}
                  });
                  return user.save();
              })
              .then(result=>{
                  res.redirect('/login');
              })
              .catch(err=>{
                  console.log("Hashing problem "+ err);
              });
        })
        .catch(err=> console.log(err))

    // console.log(email,password,confirmPassword);
};