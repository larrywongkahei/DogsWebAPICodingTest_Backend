import { 
    checkIfUserFolderExist,
    readUserAuth,
 } from "./database_controller";

function validateForRegister(username, password){
    let dataToReturn = {
        success: false,
        description: ""
    }
    // User exist
    if(checkIfUserFolderExist){
        dataToReturn.success = false;
        dataToReturn.description = "Username is in used,if already registered, Please login.";
        return dataToReturn;
    }

    const userData = readUserAuth();
    console.log(userData);
}