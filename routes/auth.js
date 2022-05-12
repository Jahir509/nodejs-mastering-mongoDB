const express = require('express');
const router = express.Router();
const { check,body } = require('express-validator');
const authController = require('../controllers/auth.controller');

router.get('/login', authController.login);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post('/signup',
        [
            check('email')
                .isEmail()
                .withMessage('Please enter a valid email')
                .normalizeEmail()
                .custom((value,{req})=>{
                    if(value === 'jahir@gmail.com'){
                        throw new Error('This email is forbidden.');
                    }
                    return true;
                }),
            body(
                'password',
                'Please Enter a valid password with only letter & numbers and at least 5 characters'
                )
                .isLength({min:3})
                .isAlphanumeric()
                .trim(),
            body('confirmPassword')
                .trim()
                .custom((value,{req})=>{
                    if(value !== req.body.password){
                        throw new Error(`Password didn't match`)
                    }
                    return true;
                })
        ],
        authController.postSignUp
    );

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.resetPassword);


module.exports = router;