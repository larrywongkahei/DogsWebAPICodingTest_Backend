const { checkIfUserFolderExist } = require("../../database_controller");

module.exports = function UsernameValidate(req, res, next){
    let dataToReturn = {
        success: false,
        description: ""
    }

    if(!checkIfUserFolderExist(req.body.username)){
        console.log('not exist')
        dataToReturn.success = false;
        dataToReturn.description = "Wrong username or password, input data does not match our data.";
        res.status(401).send(dataToReturn);
        return;
    }
    
    next();
}