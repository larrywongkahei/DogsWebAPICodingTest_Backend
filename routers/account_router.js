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
        return res.status(200).send(data);
    }else{
        return res.status(400).send(data);
    }
})

router.post('/login', login_Username_validator, password_validator, jwt_assign, (req, res) => {
    return res.status(200).json({success:true, description: "Successfully logged in"})
})

module.exports = router;