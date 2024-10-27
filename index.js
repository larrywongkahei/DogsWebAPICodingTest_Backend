const express = require('express');
const cors = require('cors');
const cookiesParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

require('dotenv').config();


// Import routers
const account_router = require("./routers/account_router");
const dogs_router = require("./routers/dogs_router");

const path = require('path');
const { formatJSON, formatDefaultJSON } = require('./database_controller');
const app = express();

app.use(
    cors(
        {
					origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
            credentials: true,
        }
));
app.use(fileUpload());
app.use(express.json());
app.use(cookiesParser());

// Initialize routers
app.use("/account", account_router);
app.use("/api", dogs_router);
app.options("*", cors());

const port = process.env.PORTS || 3001;


/*
- Login, Register with JSON and hashed password with salt
*/
app.get("/", (req, res) => {
    formatDefaultJSON();
    res.send("hi");
})

app.listen(port, () => {
    console.log(`Service is running on port ${port}`);
})


