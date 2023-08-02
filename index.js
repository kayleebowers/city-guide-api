const express = require("express"),
  //modules to log data, work with directories/file paths, write file streams
  morgan = require("morgan"),
  path = require("path"),
  fs = require("fs"),
  //add cors to manage request origins
  cors = require("cors"),
  // add ODM
  mongoose = require("mongoose"),
  models = require("./models.js"),
  //add express validator
  { check, validationResult } = require("express-validator");

const app = express(),
  Activities = models.Activity,
  Users = models.User;

//connect to online db
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//order: logging, user authentication, JSON parsing, static file serving, and app routing

//create log stream
const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//log HTTP method, date, endpoint, req status, res length
app.use(
  morgan(":method :date[web] :url :status :res[content-length]", {
    stream: logStream,
  })
);

//allow requests from all origins
app.use(cors());

let allowedOrigins = ["https://pegasus-city-guide.netlify.app/"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = "The CORS policy for this application doesn’t allow access from origin " + origin;
      return callback(new Error(message), false)
    }
    return callback(null, true);
  }
}))

//use bodyParser in older versions of express 
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

//read req.body JSON data and populate it in response body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import login route/authentication
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

// Allow new users to register	/users	POST
app.post(
  "/users",
  //validate input on server side
  [
    check("Username", "Username must be five characters or more")
      .isLength({ min: 5 })
      .isAlphanumeric(),
    check("Password", "Password must be five characters or more").isLength({
      min: 5,
    }),
    check("Email", "Email is required").isEmail(),
  ],
  (req, res) => {
    //check for validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          res.status(400).send("User already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              res.status(500);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Allow users to view their profile	/users/:id	GET
app.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ _id: req.params.id })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Allow users to update their user info	/users/:id	PUT
app.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  //validate input on server side
  [
    check("Username", "Username must be five characters or more")
      .isLength({ min: 5 })
      .isAlphanumeric(),
    check("Password", "Password must be five characters or more").isLength({
      min: 5,
    }),
    check("Email", "Email is required").isEmail(),
  ],
  (req, res) => {
    //check for validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("User does not exist");
        } else {
          res.status(200).json(updatedUser);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Allow existing users to delete their account	/users/:id	DELETE
app.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.deleteOne({ _id: req.params.id })
      .then((user) => {
        res.status(200).send("Your account was deleted");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Return a list of all activities to the user	/activities	GET
app.get("/activities", (req, res) => {
  Activities.find()
    .then((activities) => {
      res.status(200).json(activities);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Add activity to to-do list	/users/:id/activities/:activitiesId	POST
app.post(
  "/users/:id/activities/:activitiesId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { Todos: req.params.activitiesId } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Remove activity from to-do list	/users/:id/activities/:activitiesId	DELETE
app.delete(
  "/users/:id/activities/:activitiesId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { Todos: req.params.activitiesId } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Display all completed activities	/users/:id/activities/:completed	GET
app.get(
  "/users/:id/completed/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ _id: req.params.id })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Add activity to completed list	/users/:id/completed/:activitiesId	POST
app.post(
  "/users/:id/completed/:activitiesId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { Completed: req.params.activitiesId } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Remove activity from completed list	/users/:id/activities/:completed	DELETE
app.delete(
  "/users/:id/completed/:activitiesId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { Completed: req.params.activitiesId } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/documentation.html"));
});

//add error handling middleware to catch any other errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
