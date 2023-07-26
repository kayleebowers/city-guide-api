const express = require("express"),
    morgan = require("morgan"),
    path = require("path");

const app = express(); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/documentation.html"));
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})