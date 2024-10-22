const express = require('express');
const jwt_validator = require('../middlewares/jwt/jwt_validate');
const { formatJSON, saveJSONFile, getUserDirPath } = require('../database_controller');
const path = require('path');

const router = express.Router();

router.get('/', jwt_validator, async (req, res) => {
    res.status(200).json({success:true, description: "got data"});
})

router.post('/fileUpload', jwt_validator, async (req, res) => {
    try{
        if(!req.files){
            return res.status(400).json({
                success: false,
                description: "Failed to upload. File not found or file type not match."
            });
        }

        
        if(req.files.jsonFile){
            const file = req.files.jsonFile;

            if(file.mimetype !== 'application/json'){
                return res.status(400).json({success: false, description: "File type error."})
            }

            const jsonData = file.data.toString('utf8');

            let formattedData = JSON.parse(jsonData);

            let newData = formatJSON(formattedData);

            saveJSONFile(newData, req.userName);

        }

        if(req.files.image){
            const image = req.files.image;

            if(!image.mimetype.startsWith('image/')){
                return res.status(400).json({success: false, description: "File type error."})
            }

            const imagePath = getUserDirPath(req.userName, image.name)
            await image.mv(imagePath);
        }
    }catch(error){
        return res.status(500).json({success: false, description: "File upload process failed, please try again later."})
    }
    return res.status(200).send({description: "success"})
})

module.exports = router;