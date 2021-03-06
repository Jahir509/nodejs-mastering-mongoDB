const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../model/user.model');
const nodemailer = require('nodemailer');
const config = require('config');
const { validationResult } = require('express-validator');

// const sendGridTransport = require('nodemailer-sendgrid-transport');

// const transporter = nodemailer.createTransport(sendGridTransport({
//     auth:{
//         api_key: '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'
//     }
// }))

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('MAILSERVER.GMAIL.USER'),
        pass: config.get('MAILSERVER.GMAIL.PASSWORD')
    }
})

exports.login = (req,res,next)=>{
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    }else{
        errorMessage = null;
    }
    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage,
        oldInput:{
            email: '',
            password: ''
        },
        validationErrors:[]
    })
};

exports.postLogin = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    User.findOne({email:email})
        .then(user=>{
           if(!user)
           {
               return res.status(422)
                   .render('auth/login',{
                       path: '/login',
                       pageTitle: 'login',
                       errorMessage:'Invalid Email',
                       oldInput:{
                           email: email,
                           password: password
                       },
                       validationErrors: errors.array()
                   });
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
                   return res.status(422)
                       .render('auth/login',{
                           path: '/login',
                           pageTitle: 'login',
                           errorMessage:'Invalid Password',
                           oldInput:{
                               email: email,
                               password: password
                           },
                           validationErrors: errors.array()
                       });
               })
               .catch(err=>{
                   console.log("Hash doesn't match" + err);
                   res.redirect('/login');
               });
        })
        .catch(err=> {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.postLogout = (req,res,next)=> {
    req.session.destroy((err)=>{
       // console.log(err);
        res.redirect('/');
    });
};

exports.getSignUp = (req,res,next)=> {
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    }else{
        errorMessage = null;
    }
    res.render('auth/signup',{
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage:errorMessage,
        oldInput:{
            email: '',
            password: ''
        },
        validationErrors: []
    })
};

exports.postSignUp = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
   // console.log(errors)
    if(!errors.isEmpty()){
       // console.log(errors)
        return res.status(422)
            .render('auth/signup',{
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage:errors.array()[0].msg,
            oldInput:{
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }
    User.findOne({email: email})
        .then(userData=>{
            if(userData)
            {
                return res.status(422)
                    .render('auth/signup',{
                        path: '/signup',
                        pageTitle: 'Signup',
                        errorMessage:'Email already exist.',
                        oldInput:{
                            email: email,
                            password: password
                        },
                        validationErrors: []
                });
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
                  transporter.sendMail({
                      to: email,
                      from: config.get('MAILSERVER.GMAIL.USER'),
                      subject:'Signup Completion',
                      html:'<h1>You successfully signed up!</h1>'
                  })
                  .catch(err=>{
                      console.log("Mail Error");
                      console.log(err);
                  });
              })
              .catch(err=>{
                  console.log("Hashing problem "+ err);
              });
        })
        .catch(err=> {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

    // console.log(email,password,confirmPassword);
};

exports.getReset = (req,res,next)=> {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/reset',{
        path:'/reset',
        pageTitle:'Reset Password',
        errorMessage: message,
    });
};

exports.postReset = (req,res,next)=> {
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error','No account with that email found')
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result=>{
            req.flash('password-reset','A reset password setting has been sent to your email')
            res.redirect('/')
            transporter.sendMail({
                to: req.body.email,
                from: config.get('MAILSERVER.GMAIL.USER'),
                subject:'Password Reset',
                html: `
                    <p>You requested a password reset</p>
                    <p> Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password</p>
                 `
            })
            .catch(err=>{
                console.log("Mail Error");
                console.log(err);
            }); 
        })
        .catch(err=>{
            console.log("Reset Token Error....");
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    });
};

exports.resetPassword = (req,res,next)=> {
    const newPassword = req.body.password1;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
            _id: userId,
            resetToken:passwordToken,
            resetTokenExpiration:{$gt:Date.now()}
        })
        .then(user=>{
            resetUser = user;
            return bcrypt.hash(newPassword,12)
        })
        .then(hashedPassword=>{
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result=>{
            res.redirect('/login')
        })
        .catch(err=> {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    });
};

exports.getNewPassword = (req,res,next)=> {
    const token = req.params.token;
    console.log(token);
    User.findOne({
            resetToken:token,
            resetTokenExpiration:{$gt:Date.now()}
        })
        .then(user=>{
            let errorMessage = req.flash('error');
            if(errorMessage.length > 0){
                errorMessage = errorMessage[0];
            }else{
                errorMessage = null;
            }
            res.render('auth/new-password',{
                path: '/new-password',
                pageTitle: 'Reset Password',
                errorMessage: errorMessage,
                userId: user._id.toString(),
                passwordToken: token
            })
        }).
        catch(err=> {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}