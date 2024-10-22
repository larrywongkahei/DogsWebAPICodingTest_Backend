const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');
const uuid = require('uuid');

// To check if user exist or duplicate user name
function checkIfUserFolderExist(name){
    return fs.existsSync(path.join(__dirname, "data", name));
}

function readUserAuth(name){
    let dataToReturn = {
        success: false,
        description: ""
    }

    try{
       return JSON.parse(fs.readFileSync(path.join(__dirname, "data", name, "userAuth.json")));
    }catch(error){
        dataToReturn.description = "Can't not access user data, please try again later.";
    }
    
}

async function createUser(userAuth){
    let dataToReturn = {
        success: false,
        description: ""
    }

    // Create user folder
    try{
        fs.mkdirSync(path.join(__dirname, "data", userAuth.username));
    }catch(error){
        dataToReturn.description = "Username in used, please login if already registered."
        return dataToReturn;
    }

    const data = await getHashedPassword(userAuth.password)

    if(!data.success){
        return data;
    }

    //Convert data to string
    let convertedData = "";

    const userId = uuid.v4();

    try{
        convertedData = JSON.stringify({...userAuth, password: data.data, userId: userId});
    }catch(error){
        dataToReturn.description = error
        return dataToReturn;
    }

    // Write user auth data in json file
    fs.writeFileSync(path.join(__dirname, "data", userAuth.username, "userAuth.json"), convertedData, function(err){
        if(err){
            dataToReturn.description = err
            return dataToReturn;
        }
    });
    
    dataToReturn.success = true;
    dataToReturn.description = "Successfully registered"
    return dataToReturn;
}

async function validatePassword(inputPassword, userPassword){
    let dataToReturn = {
        success: false,
        description: ""
    }
    try {
        const result = await argon2.verify(userPassword, inputPassword);
        if(!result){
            dataToReturn.description = "Wrong username or password, input data does not match our data.";
            return dataToReturn;
        }
        dataToReturn.success = true;
        return dataToReturn;
    }catch(error){
        return dataToReturn;
    }
    
}

async function getHashedPassword(password){

    let dataToReturn = {
        success: false,
        description:""
    }

    try {
        const hash = await argon2.hash(password);
        dataToReturn.success = true;
        dataToReturn.data = hash;
        return dataToReturn;
    }catch(error){
        dataToReturn.description = error;
        return dataToReturn;
    }
}

// Function to be called within two format json functions, will take in a arg object
// I found that to call sub breed would need to use /breed/Breed/Sub-breed by checking the request url dog.ceo sent with fetching data
function formatJSON(data){
    let formattedDogList = [];
    let shadowData = {...data};
    for(key of Object.keys(shadowData)){
        let dataToAdd = {};
        dataToAdd.name = key;
        dataToAdd.sub_breed = [];
        // Check if dog has sub-breed
        if(shadowData[key].length > 1){
            let subData = {};
            shadowData[key].forEach((each) => {
                subData.name = each;
                subData.imagePath = `https://dog.ceo/api/breed/${key}/${each}/images/random`;
                dataToAdd.sub_breed.push(subData);
            })
        };
        dataToAdd.imagePath = `https://dog.ceo/api/breed/${key}/images/random`
        formattedDogList.push(dataToAdd);
    }
    return formattedDogList;

}

async function formatUploadedJSON(jsonString){
    const data = JSON.parse(jsonString);
    return data;
}

function formatDefaultJSON(){
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "dogs.json")));
    return data;

}

function saveJSONFile(convertedData, userName){
    fs.writeFileSync(path.join(__dirname, "data", userName, "dogs.json"), JSON.stringify(convertedData, null, 2), function(err){
        if(err){
            dataToReturn.description = err
            return dataToReturn;
        }
    });

}

function getUserDirPath(userName, filename=""){
    if(filename.length > 1){
        const extension = filename.split('.')[1];
        return path.join(__dirname, "data", userName, `icon.${extension}`);

    }
    return path.join(__dirname, "data", userName);
}

module.exports = {
    checkIfUserFolderExist,
    formatUploadedJSON,
    formatDefaultJSON,
    validatePassword,
    getUserDirPath,
    saveJSONFile,
    readUserAuth,
    formatJSON,
    createUser,
}