const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.get('/login', authController.login);

router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

module.exports = router;