const { readUserAuth, validatePassword } = require("../../database_controller");

module.exports = function Password_validate(req, res, next){
    let dataToReturn = {
        success: false,
        description: ""
    }

    const userAuth = readUserAuth(req.body.username);

    if(!validatePassword(userAuth.password, req.body.password)){
        console.log('password not right')
        dataToReturn.success = false;
        dataToReturn.description = "Wrong username or password, input data does not match our data.";
        res.status(401).send(dataToReturn);
        return;
    }
    
    next();
}