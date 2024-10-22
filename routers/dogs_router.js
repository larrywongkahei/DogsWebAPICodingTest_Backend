
const express = require('express');
const jwt_validator = require('../middlewares/jwt/jwt_validate');

const router = express.Router();

router.get('/', jwt_validator, async (req, res) => {
    res.status(200).json({success:true, description: "got data"});
})

// router.post('/login', login_Username_validator, password_validator, (req, res) => {
//     res.status(200).send({description: "success"})
// })

module.exports = router;