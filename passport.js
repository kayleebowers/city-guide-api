const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  models = require("./models.js"),
  passportJWT = require("passport-jwt");

//basic HTTP authentication for login
passport.use(
  new LocalStrategy(
    {
      usernameField: Username,
      passwordField: Password,
    },
    function (username, password, done) {
      User.findOne({ Username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (!user.verifyPassword(password)) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      });
    }
  )
);
