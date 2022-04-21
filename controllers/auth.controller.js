

exports.login = (req,res,next)=>{
    console.log(req.get('Cookie').split(';')[0]);
    res.render('auth/login',{
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.isLoggedIn
    })
};

exports.postLogin = (req,res,next)=> {
    req.isLoggedIn = true;
    res.setHeader('Set-Cookie','isloggedIn=true')
    res.redirect('/')
};