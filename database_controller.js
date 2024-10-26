const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');
const uuid = require('uuid');
const axios = require('axios');

// To check if user exist or duplicate user name
function checkIfUserFolderExist(name) {
    return fs.existsSync(path.join(__dirname, "data", name));
}

async function getDogsByUserName(name) {
    const data = await fs.promises.readFile(path.join(__dirname, "data", name, "dogs.json"));
    return JSON.parse(data).sort((a,b) => a.name.localeCompare(b.name));
    // return JSON.parse(await fs.readFile(path.join(__dirname, "data", name, "dogs.json"))).sort((a, b) => a.name.localeCompare(b.name));
}

function readUserAuth(name) {
    let dataToReturn = {
        success: false,
        description: ""
    }

    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, "data", name, "userAuth.json")));
    } catch (error) {
        dataToReturn.description = "Can't not access user data, please try again later.";
    }
}

function removeMainBreedDogFromFile(userName, dogs, index) {
    const shadowList = [...dogs];
    shadowList.splice(index, 1);
    saveJSONFile(shadowList, userName);
    return shadowList;
}

function removeSubBreedDogFromFile(userName, dogs, mainIndex, subIndex) {
    const shadowList = [...dogs];
    shadowList[mainIndex]['sub_breed'].splice(subIndex, 1);
    saveJSONFile(shadowList, userName);
    return shadowList;

}

async function checkIfExist(userName, main, sub = "") {
    const dogs = await getDogsByUserName(userName);

    if (sub.length === 0) {
        return dogs.findIndex((dog) => dog.name === main) !== -1;
    }

    const mainIndex = dogs.findIndex((dog) => dog.name === main);

    return dogs[mainIndex]['sub_breed'].findIndex((dog) => dog.name === sub) !== -1;
}

async function updateDog(userName, name, main_breed, sub_breed, imagePath, description) {
    const dogs = await getDogsByUserName(userName);

    let dataToReturn = {
        success: false,
        description: "",
    }
    let isMainBreed = main_breed.length === 0;
    let targetName = isMainBreed ? name : main_breed;

    let shadowDogs = [...dogs];

    const mainIndex = shadowDogs.findIndex((dog) => dog.name === targetName);

    //Cant change image of sub breed.
    // Meaning that it is a main Breed.
    if (sub_breed !== null) {

        shadowDogs[mainIndex] = {
            name,
            description,
            sub_breed,
            imagePath
        }
    } else {
        const subIndex = shadowDogs[mainIndex]["sub_breed"].findIndex((sub) => sub.name === name);

        shadowDogs[mainIndex]["sub_breed"][subIndex] = {
            name,
            description,
            imagePath
        }
    }


    saveJSONFile(shadowDogs, userName);
    dataToReturn.success = true;
    dataToReturn.description = "Successfully updated!";
    return dataToReturn;

}

async function createDog(userName, mainBreed, subBreed, imagePath, description) {
    let dataToReturn = {
        success: false,
        description: "",
    }
    const dogs = await getDogsByUserName(userName);

    let shadowDogs = [...dogs];

    // Meaning that it is a main Breed.
    if (subBreed.length === 0) {
        shadowDogs.push(
            {
                name: mainBreed,
                description: description,
                sub_breed: [],
                imagePath: imagePath
            })
    } else {
        const mainIndex = shadowDogs.findIndex((dog) => dog.name === mainBreed);
        shadowDogs[mainIndex]["sub_breed"].push({
            name: subBreed,
            description,
            imagePath
        })
    }

    saveJSONFile(shadowDogs, userName);

    dataToReturn.success = true;
    dataToReturn.description = "Successfully added!";
    return dataToReturn;

}

async function removeDog(userName, main, sub = "") {

    let dataToReturn = {
        success: false,
        description: "",
        data: []
    }

    const dogs = await getDogsByUserName(userName);
    const mainIndex = dogs.findIndex((dog) => dog.name === main);

    if (mainIndex === -1) {
        dataToReturn.description = "Dog not exist. Please report this problem."
        return dataToReturn;
    }

    if (sub.length === 0) {
        try {
            dataToReturn.data = removeMainBreedDogFromFile(userName, dogs, mainIndex);
            dataToReturn.success = true;
            dataToReturn.description = "Successfully deleted";
            return dataToReturn;
        } catch (error) {
            dataToReturn.description = "Dog can not be removed. Please report this problem."
            return dataToReturn;
        }
    }

    const subIndex = dogs[mainIndex]["sub_breed"].findIndex((dog) => dog.name === sub);

    if (subIndex === -1) {
        dataToReturn.description = "Dog not exist. Please report this problem."
        return dataToReturn;
    }

    try {
        dataToReturn.data = removeSubBreedDogFromFile(userName, dogs, mainIndex, subIndex);
        dataToReturn.success = true;
        dataToReturn.description = "Successfully deleted";
        return dataToReturn;
    } catch (error) {
        dataToReturn.description = "Dog can not be removed. Please report this problem."
        return dataToReturn;
    }
}

async function createUser(userAuth) {
    let dataToReturn = {
        success: false,
        description: ""
    }

    // Create user folder
    try {
        fs.mkdirSync(path.join(__dirname, "data", userAuth.username));
    } catch (error) {
        dataToReturn.description = "Username in used, please login if already registered."
        return dataToReturn;
    }

    const data = await getHashedPassword(userAuth.password)

    if (!data.success) {
        return data;
    }

    //Convert data to string
    let convertedData = "";

    const userId = uuid.v4();

    try {
        convertedData = JSON.stringify({ ...userAuth, password: data.data, userId: userId });
    } catch (error) {
        dataToReturn.description = error
        return dataToReturn;
    }

    // Write user auth data in json file
    fs.writeFileSync(path.join(__dirname, "data", userAuth.username, "userAuth.json"), convertedData, function (err) {
        if (err) {
            dataToReturn.description = err
            return dataToReturn;
        }
    });

    // Write default dogs data in dogs.json
    const dogs = JSON.parse(fs.readFileSync(path.join(__dirname, "default_dogs.json")));
    // Use this line when made changes to json data structure. To reload default_dogs.json file.
    // const dogs = await formatDefaultJSON(); 
    saveJSONFile(dogs, userAuth.username);

    dataToReturn.success = true;
    dataToReturn.description = "Successfully registered"
    return dataToReturn;
}

async function validatePassword(inputPassword, userPassword) {
    let dataToReturn = {
        success: false,
        description: ""
    }
    try {
        const result = await argon2.verify(userPassword, inputPassword);
        if (!result) {
            dataToReturn.description = "Wrong username or password, input data does not match our data.";
            return dataToReturn;
        }
        dataToReturn.success = true;
        return dataToReturn;
    } catch (error) {
        return dataToReturn;
    }

}

async function getHashedPassword(password) {

    let dataToReturn = {
        success: false,
        description: ""
    }

    try {
        const hash = await argon2.hash(password);
        dataToReturn.success = true;
        dataToReturn.data = hash;
        return dataToReturn;
    } catch (error) {
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

async function formatJSON(data) {
    let formattedDogList = [];
    let shadowData = { ...data };
    for (key of Object.keys(shadowData)) {
        let dataToAdd = {};
        dataToAdd.name = key;
        dataToAdd.description = "";
        dataToAdd.sub_breed = [];
        // Check if dog has sub-breed
        if (shadowData[key].length > 0) {
            for (const each of shadowData[key]) {
                let subData = {};
                subData.name = each;
                subData.description = "";
                try {
                    const { data } = await axios.get(`https://dog.ceo/api/breed/${key}/${each}/images/random`);
                    const { message } = data;
                    subData.imagePath = message;
                    dataToAdd.sub_breed.push(subData);
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                }
            }
        };
        try {
            const { data } = await axios.get(`https://dog.ceo/api/breed/${key}/images/random`);
            const { message } = data;
            dataToAdd.imagePath = message
            formattedDogList.push(dataToAdd);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
        }
    }
    return formattedDogList;
};

async function getMainBreedData(userName, main_breed_name){
    let dataToReturn = {
        success: false,
        description: "",
        data: [],
        status:400,
    }

    const dogs = await getDogsByUserName(userName);
    const index = dogs.findIndex((dog) => dog.name === main_breed_name);
    if(index === -1){
        description = "Dog not exist";
        return dataToReturn;
    };

    dataToReturn.success = true;
    dataToReturn.description = "Data Fetched";
    dataToReturn.data = dogs[index];
    dataToReturn.status = 200;
    return dataToReturn;

}


async function updateFetchedData(userName, main, sub, imagePath) {
    let dataToReturn = {
        success: false,
        discription: "",
        data: []
    }

    try {
        const dogs = await getDogsByUserName(userName);

        const shadowDogs = [...dogs];

        const mainIndex = shadowDogs.findIndex((dog) => dog.name === main);

        if (mainIndex === -1) {
            dataToReturn.discription = "Dog not exist";
            return dataToReturn;
        }

        if (sub.length === 0) {
            shadowDogs[mainIndex]['imagePath'] = imagePath;
        } else {
            const subIndex = shadowDogs[mainIndex]["sub_breed"].findIndex((dog) => dog.name === sub);

            if (subIndex === -1) {
                dataToReturn.discription = "Dog not exist";
                return dataToReturn;
            }

            shadowDogs[mainIndex]['sub_breed'][subIndex]['imagePath'] = imagePath;
        }

        saveJSONFile(shadowDogs, userName);
        dataToReturn.success = true;
        dataToReturn.discription = "Updated";
        dataToReturn.data = shadowDogs;
        return dataToReturn;
    } catch (error) {
        dataToReturn.discription = error;
        return dataToReturn;
    }
}


    //     if (formattedDogName.length > 1) {
    //         const fName = formattedDogName[0];
    //         const bName = formattedDogName[1];

    //         try {
    //             const userDogs = getDogsByUserName(userName);
    //             const shadowDogs = [...userDogs];
    //             if(dogName.split("-").length > 1){

    //             }
    //             const indexOfDog = shadowDogs.findIndex((dog) => dog.name === fName);

    //             const mainBreed = shadowDogs[indexOfDog];

    //             const sub_breedIndex = mainBreed.sub_breed.findIndex((dog) => dog.name === bName);
    //             const dogToUpdate = mainBreed.sub_breed[sub_breedIndex];

    //             const shadow = { ...dogToUpdate, imagePath: imagePath }
    //             mainBreed.sub_breed[sub_breedIndex] = shadow;

    //             saveJSONFile(shadowDogs, userName);
    //             //Add status
    //             dataToReturn.success = true;
    //             dataToReturn.subscription = "Successfully updated";
    //             dataToReturn.data = shadowDogs;
    //             return dataToReturn

    //         } catch (error) {
    //             dataToReturn.subscription = "Update failed, Please try agin later"
    //             return dataToReturn
    //         }
    //     }

    //     try {
    //         const userDogs = getDogsByUserName(userName);
    //         const indexOfDog = userDogs.findIndex((dog) => dog.name === dogName);

    //         const dogToUpdate = userDogs[indexOfDog];

    //         const shadow = { ...dogToUpdate, imagePath: imagePath }
    //         userDogs[indexOfDog] = shadow;

    //         saveJSONFile(userDogs, userName);
    //         dataToReturn.success = true;
    //         dataToReturn.subscription = "Successfully updated";
    //         return dataToReturn

    //     } catch (error) {
    //         dataToReturn.subscription = "Update failed, Please try agin later"
    //         return dataToReturn
    //     }
    // }

    async function formatDefaultJSON() {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, "dogs.json")));
        return await formatJSON(data);

    }

    function saveJSONFile(convertedData, userName) {
        return fs.writeFileSync(path.join(__dirname, "data", userName, "dogs.json"), JSON.stringify(convertedData, null, 2), function (err) {
            if (err) {
                dataToReturn.description = err
                return dataToReturn;
            }
        });

    }

    // Used for saving image
    function getUserDirPath(userName, filename = "") {
        if (filename.length > 1) {
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
        getMainBreedData, 
        getUserDirPath,
        saveJSONFile,
        readUserAuth,
        checkIfExist,
        formatJSON,
        createUser,
        updateDog,
        createDog,
        removeDog,
    }