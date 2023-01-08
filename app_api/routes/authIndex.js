var express = require("express");
var ctrlOwners = require("../controllers/owners")

var router = express.Router();


router.post("/signup", ctrlOwners.signup);

router.post("/login", ctrlOwners.login);

module.exports = router;