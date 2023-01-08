const multer = require("multer");
const mongoose = require("mongoose");
var ctrlOwners = require("../controllers/owners");
var ctrlFiles = require("../controllers/files");

var adminStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    adminFileNamingFunction(req, file, cb);
  },
});

adminFilterFile = function (req, file, cb) {
  //using the requirement object as a support for different error situations
  req.customFields = {};
  req.customFields.fileFound = true; //This is not necessary because if the file is not specified, then multer does not call any of the middleware functions related to storing the file
  req.customFields.fullParameters = true;
  req.customFields.databaseError = false;
  req.customFields.ownerFound = true;

  //determine if file was sent
  if (file === undefined) {
    req.customFields.fileFound = false;
    cb(null, false);
    return;
  }

  //determine if all the parameters are present in the request
  if (!(req.body.name && req.body.pages && req.body.owner && req.body.data)) {
    req.customFields.fullParameters = false;
    cb(null, false);
    return;
  }

  //determine if owner exists
  ctrlOwners.OwnerElementModel.findOwnerById(
    req.body.owner,
    function (err, doc) {
      //Error with the mongo request
      if (err) {
        req.customFields.databaseError = true;
        cb(null, false);
        return;
      }

      if (doc == null) {
        //The owner does not exist

        req.customFields.ownerFound = false;
        cb(null, false);
        return;
      }

      cb(null, true);
    }
  );
};

adminFileNamingFunction = function (req, file, cb) {
  //In order to name the new file, first we need to create the document in the database to extract its id
  var numP = Number(req.body.pages);
  if (numP < 1) numP = 1;

  var newFile = {
    name: req.body.name,
    pages: numP,
    uploadDate: Date.now(),
    owner: new mongoose.mongo.ObjectId(req.body.owner),
    data: req.body.data,
  };

  ctrlFiles.FileElementModel.create(newFile, function (err, doc) {
    if (err) {
      req.customFields.databaseError = 1;
      return;
    }
    
    var newFileName = doc._id.toString() + ".pdf";
    req.customFields.idOfFile = doc._id.toString();

    cb(null, newFileName);
  });
};

const upload = multer({ storage: adminStorage, fileFilter: adminFilterFile });
const adminUploadManager = upload.single("filenameForMulter");
module.exports = adminUploadManager;
