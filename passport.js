const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

//basic HTTP authentication for login
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    function (username, password, done) {
      Users.findOne({ Username: username }, function (err, user) {
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
