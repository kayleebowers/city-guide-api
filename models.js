const mongoose = require('mongoose');

//define activity schema
let activitySchema = mongoose.Schema({
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    Type: { type: String, required: true },
    ImagePath: String,
    Completed: Boolean,
    Address: String,
    Price: String,
    Website: String
});

//define users schema
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Todos: [String],
    Completed: [String]
});

//declare models
let Activities = mongoose.model("Activities", activitySchema);
let User = mongoose.model("User", userSchema);
