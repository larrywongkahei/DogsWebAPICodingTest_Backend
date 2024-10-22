const express = require('express');

const router = express.Router();

router.post('/create', (req, res) => {
    console.log("This is account router");
    res.send("received");
})

module.exports = router;