const { checkIfUserFolderExist } = require("../../database_controller");

module.exports = function UsernameValidate(req, res, next){
    let dataToReturn = {
        success: false,
        description: ""
    }

    if(checkIfUserFolderExist(req.body.username)){
        dataToReturn.success = false;
        dataToReturn.description = "Username in use. If you already registered, please try logging in.";
        return res.status(401).send(dataToReturn);
    }

    next();
}