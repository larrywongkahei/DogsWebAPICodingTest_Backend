const express = require('express');
const { createUser } = require('../database_controller');
const register_Username_validator = require("../middlewares/register/username_validate");
const login_Username_validator = require("../middlewares/login/username_validate");
const password_validator = require('../middlewares/login/password_validate');
const jwt_assign = require('../middlewares/jwt/jwt_assign');

const router = express.Router();

router.post('/register', register_Username_validator, async (req, res) => {
    const userAuth = req.body;
    const data = await createUser(userAuth);
    if(data.success){
        res.status(200).send(data);
    }else{
        res.status(400).send(data);
    }
})

router.post('/login', login_Username_validator, password_validator, jwt_assign, (req, res) => {
    console.log('hi')
    console.log(req.token);
    // res.setHeader("Authorization", `Bearer ${req.token}`);
    // res.setHeader('Access-Control-Expose-Headers', 'Authorization');

    // res.cookie('jwt_token', req.token, {
    //     httpOnly: true,
    //     maxAge: 3600000,
    //     sameSite: 'Strict'
    // })

    res.status(200).json({description: "success"})
})

module.exports = router;