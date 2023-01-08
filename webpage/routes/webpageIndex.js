var path = require("path");
var express = require("express");
var ctrlOwners = require("../../app_api/controllers/owners")

var router = express.Router();

//send main webpage when requested

router.get("/", function (req, res, next) {
  res.sendFile(path.join(__basedir + "/public/index/mainPage.html"));
});



module.exports = router;
