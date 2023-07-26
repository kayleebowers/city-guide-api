const express = require("express"),
    bodyParser = require("body-parser"),
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

// Allow new users to register	/users	POST
app.post("/users", (req, res) => {
    res.status(201);
})

// Allow users to view their profile	/users/:id	GET
app.get("/users/:id", (req, res) => {
    res.status(200);
})

// Allow users to update their user info	/users/:id	PUT
app.put("users/:id", (req, res) => {
    res.status(200);
})

// Allow existing users to delete their account	/users/:id	DELETE
app.delete("/users/:id", (req, res) => {
    res.status(200);
})

// Return a randomized list of all activities to the user	/activities	GET
app.get("/activities", (req, res) => {
    res.status(200);
})

// Add activity to to-do list	/users/:id/activities/:activitiesId	POST
app.post("/users/:id/activities/:activitiesId", (req, res) => {
    res.status(201);
})

// Remove activity from to-do list	/users/:id/activities/:activitiesId	DELETE
app.delete("/users/:id/activities/:activitiesId", (req, res) => {
    res.status(200);
})

// Display all completed activities	/users/:id/activities/:completed	GET
app.get("/users/:id/activities/:completed", (req, res) => {
    res.status(200);
})

// Add activity to completed list	/users/:id/activities/:completed	POST
app.post("/users/:id/activities/:completed", (req, res) => {
    res.status(201);
})

// Remove activity from completed list	/users/:id/activities/:completed	DELETE
app.delete("/users/:id/activities/:completed", (req, res) => {
    res.status(200);
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/documentation.html"));
})

//add error handling middleware to catch any other errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
  });
  
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})