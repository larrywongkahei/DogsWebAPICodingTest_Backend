const jwt = require('jsonwebtoken');

module.exports = function jwt_assign(req, res, next){

    try{
        const token = jwt.sign({userId: req.userId, userName: req.userName}, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
        })

        res.cookie('jwt_token', token, {
            httpOnly: true,
            // 15 minutes
            maxAge: 900000,
            sameSite: 'Strict'
        });

        next();
    }catch(error){
        return res.status(401).json({
            description: "Invalid token"
        });
    }
}