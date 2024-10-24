const jwt = require('jsonwebtoken');

module.exports = function jwt_Validator(req, res, next){
    const token = req.cookies.jwt_token;
    if(!token){
        return res.status(401).json({
            success: false,
            description: "Token expired, Please log in again"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.userId;
        req.userName = decoded.userName;
        next();
    }catch(error){
        return res.status(401).json({
            success: false,
            description: "Invalid token"
        });
    }
}