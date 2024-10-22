const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORTS || 3001;

app.use(
    cors(
        {origin: "*"}
    ));

app.get("/", (req, res) => {
    res.json(
        {data:"test"}
    )
})

app.listen(port, () => {
    console.log(`Service is running on port ${port}`);
})


