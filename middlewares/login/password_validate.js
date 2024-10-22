const { readUserAuth, validatePassword } = require("../../database_controller");

module.exports = async function Password_validate(req, res, next){
    const userAuth = readUserAuth(req.body.username);

    let verifyResult = await validatePassword(req.body.password, userAuth.password);

    if(!verifyResult.success){

        if(verifyResult.description.length > 1){
            return res.status(401).send(verifyResult);
        }

        verifyResult.description = "Wrong username or password, input data does not match our data.";
        return res.status(401).send(verifyResult);
    }
    req.userId = userAuth.userId;
    req.userName = userAuth.username;
    next();
}