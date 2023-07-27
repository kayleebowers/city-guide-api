const mongoose = require('mongoose'),
    bcrypt = require("bcrypt"),
    passport = require('passport');

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
    Email: { type: String, required: true, lowercase: true },
    // define array types in reference to Activity schema
    Todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    Completed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
});

//hash passwords added to userSchema
userSchema.statics.hashPassword = function(password) {
    return bcrypt.hashSync(password, 10);
}

//compare userSchema hashed passwords to db
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
}

//declare models
let Activity = mongoose.model("Activity", activitySchema);
let User = mongoose.model("User", userSchema);

//export models 
module.exports.Activity = Activity;
module.exports.User = User;