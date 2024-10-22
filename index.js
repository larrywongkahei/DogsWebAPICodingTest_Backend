const express = require('express');
const cors = require('cors');
const account_router = require("./account_router");
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());

app.use(
    cors(
        {origin: "*"}
));

app.use("/account", account_router);

const port = process.env.PORTS || 3001;


/*
- Login, Register with JSON and hashed password with salt
*/
app.get("/", (req, res) => {
    fs.writeFileSync(path.join(__dirname, 'data', 'user.txt'), "hello");
    res.json(
        {data:"test"}
    )

})

app.listen(port, () => {
    console.log(`Service is running on port ${port}`);
})


