const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = models.User; 

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

//authenticate with JWT
passport.use(
    new passportJWT.Strategy(
      {
        //get JWT from HTTP header
        jwtFromRequest: passportJWT.ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: "your_jwt_secret",
      },
      //act on claims in JWT
      (jwtPayload, callback) => {
        return Users.findOne({ _id: jwtPayload._id })
          .then((user) => {
            return callback(null, user);
          })
          .catch((error) => {
            return callback(error);
          });
      }
    )
  );