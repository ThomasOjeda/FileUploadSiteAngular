var express = require("express");
var bodyParser = require("body-parser");
var adminRoutes = require("./app_api/routes/adminIndex");
var userRoutes = require("./app_api/routes/userIndex");
var authenticationRoutes = require("./app_api/routes/authIndex");
var webpageRoutes = require("./webpage/routes/webpageIndex");
const mongoose = require("mongoose");
var databaseData = require("./app_api/mongoose/mongooseSchema");
var port = process.env.PORT || 3000;
// recording the base directory of the project for later use
global.__basedir = __dirname;

var app = express();



// make the public folder available for requests to the server about javascript files
app.use(express.static("public/index"));

// parse application/json (parses the body of the request as a json object)
app.use(bodyParser.json());
// for express-fileupload

app.use("/api/auth", authenticationRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/", webpageRoutes);


app.listen(port, function () {
  console.log(`App listening on port ${port}`);
  mongoose.connect(databaseData.url, function (err) {
    if (err) {
      mongoose.connection.close();
      console.log("Mongoose connection error");
      throw err;
    }
  });
});

//When ctr+c is used to stop the process, this function waits for the mongoose connection to close and then ends the process.
process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    process.exit();
  });
});
