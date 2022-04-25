const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../model/user.model');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth:{
        api_key: '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'
    }
}))

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
        errorMessage: errorMessage
    })
};

exports.postLogin = (req,res,next)=> {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
        .then(user=>{
           if(!user)
           {
               req.flash('error','Invalid Email');
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
                   req.flash('error','Invalid Password');
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
    let errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    }else{
        errorMessage = null;
    }
    res.render('auth/signup',{
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage:errorMessage
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
                req.flash('error','Email already exist.');
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
                  transporter.sendMail({
                      to: email,
                      from: 'work.jahir@outlook.com',
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
        .catch(err=> console.log(err))

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
                req.flash('error','No account with')
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
                from: 'work.jahir@outlook.com',
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
            console.log("Reset Token Error....",err);
        })
    });
};