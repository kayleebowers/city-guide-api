const express = require("express"),
    //modules to log data, work with directories/file paths, write file streams
    morgan = require("morgan"),
    path = require("path"),
    fs = require('fs');

const app = express(); 

//order: logging, user authentication, JSON parsing, static file serving, and app routing

//create log stream
const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a"});

//log HTTP method, date, endpoint, req status, res length
app.use(morgan(":method :date[web] :url :status :res[content-length]", { stream: logStream }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/documentation.html"));
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})