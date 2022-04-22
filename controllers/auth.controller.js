const User = require('../model/user.model');

exports.login = (req,res,next)=>{

    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
};

exports.postLogin = (req,res,next)=> {
    User.findById('6262241a68bebddacf8c2504')
        .then(user=>{
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(result=>{
                res.redirect('/');
            })
        })
        .catch(err=> console.log(err))
};

exports.postLogout = (req,res,next)=> {
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    });

};