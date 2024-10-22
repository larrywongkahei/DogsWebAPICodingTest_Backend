const { readUserAuth, validatePassword } = require("../../database_controller");

module.exports = async function Password_validate(req, res, next){
    const userAuth = readUserAuth(req.body.username);

    let verifyResult = await validatePassword(req.body.password, userAuth.password);

    if(!verifyResult.success){
        console.log('password not right')

        if(verifyResult.description.length > 1){
            console.log('something wrong with argon2');
            res.status(401).send(verifyResult);
            return;
        }

        verifyResult.description = "Wrong username or password, input data does not match our data.";
        res.status(401).send(verifyResult);
        return;
    }
    req.userId = userAuth.userId;
    next();
}