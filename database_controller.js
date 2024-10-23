const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');
const uuid = require('uuid');
const axios = require('axios');

// To check if user exist or duplicate user name
function checkIfUserFolderExist(name){
    return fs.existsSync(path.join(__dirname, "data", name));
}

function getDogsByUserName(name){
    return JSON.parse(fs.readFileSync(path.join(__dirname, "data", name, "dogs.json")));
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

    // Write default dogs data in dogs.json
    // const dogs = JSON.parse(fs.readFileSync(path.join(__dirname, "formattedDogs.json")));
    const dogs = await formatDefaultJSON(); 
    saveJSONFile(dogs, userAuth.username);
    
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
// function formatJSON(data){
//     let formattedDogList = [];
//     let shadowData = {...data};
//     for(key of Object.keys(shadowData)){
//         let dataToAdd = {};
//         dataToAdd.name = key;
//         dataToAdd.sub_breed = [];
//         // Check if dog has sub-breed
//         if(shadowData[key].length > 1){
//             let subData = {};
//             shadowData[key].forEach((each) => {
//                 subData.name = each;
//                 subData.imagePath = `https://dog.ceo/api/breed/${key}/${each}/images/random`;
//                 dataToAdd.sub_breed.push(subData);
//             })
//         };
//         dataToAdd.imagePath = `https://dog.ceo/api/breed/${key}/images/random`
//         formattedDogList.push(dataToAdd);
//     }
//     return formattedDogList;
// }

// Function to get all image by name ( wait two one after every request to prevent exceed limit or added load to website)

async function formatJSON (data)  {
    let formattedDogList = [];
    let shadowData = {...data};
    for(key of Object.keys(shadowData)){
        console.log('========' + key + '========')
        let dataToAdd = {};
        dataToAdd.name = key;
        dataToAdd.sub_breed = [];
        // Check if dog has sub-breed
        if(shadowData[key].length > 0){
            for(const each of shadowData[key]){
                let subData = {};
                console.log(each);
                subData.name = each;
                try{
                    const {data} = await axios.get(`https://dog.ceo/api/breed/${key}/${each}/images/random`);
                    const {message} = data;
                    subData.imagePath = message;
                    dataToAdd.sub_breed.push(subData);
                    console.log(message);
                    await new Promise(resolve => setTimeout(resolve,500));
                }catch(error){
                    console.log("Error ---------")
                }
            }
        };
        console.log("Still running");
        try{
            const {data} = await axios.get(`https://dog.ceo/api/breed/${key}/images/random`);
            const {message} = data;
            console.log(message);
            dataToAdd.imagePath = message
            formattedDogList.push(dataToAdd);
            await new Promise(resolve => setTimeout(resolve,500));
        }catch(error){
            console.log('Error =======')
        }
    }
    console.log('finished')
    return formattedDogList;
};




//TO TEST
async function updateFetchedData(dogName, userName){
    const formattedDogName = dogName.split(" ");
    if(formattedDogName.length > 1){
        const fName = formattedDogName[0];
        const bName = formattedDogName[1];

        try{
            console.log(`https://dog.ceo/api/breed/${fName}/${bName}/images/random`)
            const {data} = await axios.get(`https://dog.ceo/api/breed/${fName}/${bName}/images/random`)
            const {message, status} = data;

            console.log(message);

            const userDogs = getDogsByUserName(userName);
            const indexOfDog = userDogs.findIndex((dog) => dog.name === fName);

            const mainBreed = userDogs[indexOfDog];

            const sub_breedIndex = mainBreed.sub_breed.findIndex((dog) => dog.name === bName);
            const dogToUpdate = mainBreed.sub_breed[sub_breedIndex];

            const shadow = {...dogToUpdate, imagePath: message}
            mainBreed.sub_breed[sub_breedIndex] = shadow;

            saveJSONFile(userDogs, userName);
            //Add status
            return;

        }catch(error){
            console.log('error show in subbreed')
        }
    }

    try{
        console.log(`https://dog.ceo/api/breed/${dogName}/images/random`)
        const {data} = await axios.get(`https://dog.ceo/api/breed/${dogName}/images/random`)
        const {message, status} = data;

        console.log(message);

        const userDogs = getDogsByUserName(userName);
        const indexOfDog = userDogs.findIndex((dog) => dog.name === dogName);

        const dogToUpdate = userDogs[indexOfDog];

        const shadow = {...dogToUpdate, imagePath: message}
        userDogs[indexOfDog] = shadow;

        saveJSONFile(userDogs, userName);
        //Add status
        return;
    }catch(error){
        console.log('error main breed')
    }
}

async function formatDefaultJSON(){
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "dogs.json")));
    return await formatJSON(data);

}

function saveJSONFile(convertedData, userName){
    fs.writeFileSync(path.join(__dirname, "data", userName, "dogs.json"), JSON.stringify(convertedData, null, 2), function(err){
        if(err){
            dataToReturn.description = err
            return dataToReturn;
        }
    });

}

// Used for saving image
function getUserDirPath(userName, filename=""){
    if(filename.length > 1){
        const extension = filename.split('.')[1];
        return path.join(__dirname, "data", userName, `icon.${extension}`);

    }
    return path.join(__dirname, "data", userName);
}

module.exports = {
    checkIfUserFolderExist,
    formatDefaultJSON,
    getDogsByUserName,
    updateFetchedData,
    validatePassword,
    getUserDirPath,
    saveJSONFile,
    readUserAuth,
    formatJSON,
    createUser,
}