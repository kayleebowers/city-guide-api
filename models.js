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

//define user schema
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    // define array types in reference to Activity schema
    Todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    Completed: [{ type: mongoose.Schema.Types.Boolean, ref: 'Activity' }]
});

//declare models
let Activity = mongoose.model("Activity", activitySchema);
let User = mongoose.model("User", userSchema);

//export models 
module.exports.Activity = Activity;
module.exports.User = User;