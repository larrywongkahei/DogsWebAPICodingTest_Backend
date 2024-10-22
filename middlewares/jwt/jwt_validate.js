const jwt = require('jsonwebtoken');

module.exports = function jwt_Validator(req, res, next){
    const token = req.cookies.jwt_token;
    if(!token){
        return res.status(401).json({
            description: "Please log in first"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded);
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({
            description: "Invalid token"
        });
    }
}