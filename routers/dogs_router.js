const express = require('express');
const jwt_validator = require('../middlewares/jwt/jwt_validate');
const { formatJSON, saveJSONFile, getUserDirPath, getDogsByUserName, updateFetchedData, findDogIndex, findSubDogIndex, removeDog } = require('../database_controller');
const path = require('path');
const axios = require("axios");
const jwt_validate = require('../middlewares/jwt/jwt_validate');

const router = express.Router();

router.get('/', jwt_validator, (req, res) => {
    const data = getDogsByUserName(req.userName);
    res.status(200).json({ success: true, description: "got data", data: data });
})

router.get('/random/:main/:sub?', jwt_validator, async (req, res) => {

    let url = "";

    if (req.params.sub) {
        url = `https://dog.ceo/api/breed/${req.params.main.toLowerCase()}/${req.params.sub.toLowerCase()}/images/random`
    } else {
        url = `https://dog.ceo/api/breed/${req.params.main.toLowerCase()}/images/random`
    }

    try {
        const { data } = await axios.get(url);
        return res.json({ success: true, description: "Random image fetched!", data: data.message });

    } catch (error) {
        return res.json({ success: false, description: "Random image fetch failed, Please try again later" });
    }
})

// Need to check if exist in the json file.
router.get('/verify/:main/:sub?', jwt_validator, async (req, res) => {

    let url = "";

    if (req.params.sub) {
        url = `https://dog.ceo/api/breed/${req.params.main.toLowerCase()}/${req.params.sub.toLowerCase()}/images/random`
    } else {
        url = `https://dog.ceo/api/breed/${req.params.main.toLowerCase()}/images/random`
    }

    try {
        const { data } = await axios.get(url);
        return res.json({ success: true, description: "Successfully verified!", data: data.message });

    } catch (error) {
        return res.json({ success: false, description: "Failed verification, Please check your input" });
    }
})

router.patch('/image/:name', jwt_validator, async (req, res) => {
    const dogName = req.params.name;
    const { imagePath } = req.body;
    const data = await updateFetchedData(dogName, req.userName, imagePath);
    res.json({ success: true, description: "Updated" })
})

//Allow user to upload image or json file, if user know what they are doing. Image are for icon.
router.post('/fileUpload', jwt_validator, async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                description: "Failed to upload. File not found or file type not match."
            });
        }


        if (req.files.jsonFile) {
            const file = req.files.jsonFile;

            if (file.mimetype !== 'application/json') {
                return res.status(400).json({ success: false, description: "File type error." })
            }

            const jsonData = file.data.toString('utf8');

            let formattedData = JSON.parse(jsonData);

            let newData = formatJSON(formattedData);

            saveJSONFile(newData, req.userName);

        }

        if (req.files.image) {
            const image = req.files.image;

            if (!image.mimetype.startsWith('image/')) {
                return res.status(400).json({ success: false, description: "File type error." })
            }

            const imagePath = getUserDirPath(req.userName, image.name)
            await image.mv(imagePath);
        }
    } catch (error) {
        return res.status(500).json({ success: false, description: "File upload process failed, please try again later." })
    }
    return res.status(200).json({ description: "success" })
})

router.delete('/delete/:main/:sub?', jwt_validate, async (req, res) => {

    if(req.params.sub){
        console.log('called sub')
        const result = removeDog(req.userName, req.params.main, req.params.sub);
        return res.status(200).json(result);
    }

    const result = removeDog(req.userName, req.params.main);
    return res.status(200).json(result);

})

module.exports = router;