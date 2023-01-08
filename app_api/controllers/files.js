const mongoose = require("mongoose");
var databaseData = require("../mongoose/mongooseSchema");
var ctrlOwners = require("../controllers/owners");
var fileSystemHelpers = require("./fileSystemHelpers");

var FileElementModel = mongoose.model(
  "inventory",
  databaseData.FileSchema,
  "inventory"
);

exports.FileElementModel = FileElementModel;

module.exports.uploadFile = function (req, res) {
  //Im using the 0 value to inform OK, 1 to inform error or problem.
  if (req.customFields === undefined) {
    res.status(400);
    res.write("File was not found in requirement");
    res.end();
    return;
  }
  if (!req.customFields.fullParameters) {
    res.status(400);
    res.write(
      "Some parameters of the file were not specified in the requirement"
    );
    res.end();
    return;
  }
  if (!req.customFields.ownerFound) {
    res.status(422);
    res.write("Specified owner does not exist");
    res.end();
    return;
  }
  if (req.customFields.databaseError) {
    res.status(503);
    res.write("Database error");
    res.end();
    return;
  }

  fileSystemHelpers.savePDFPreviewImage(req.customFields.idOfFile);

  res.status(201).json({ message: "file succesfully created" });
  res.end();
};

module.exports.getAllFiles = function (req, res) {
  FileElementModel.findAllFiles(function (err, documents) {
    if (err) {
      res.status(503);
      res.end();
      return;
    }
    res.status(200);
    res.write(JSON.stringify(documents));
    res.end();
  });
};

//Function to create only the metadata of a file
module.exports.createFileMetadata = function (req, res) {
  if (!(req.body.name && req.body.pages && req.body.owner && req.body.data)) {
    res.status(400);
    res.write("Some of the parameters required were not given");
    res.end();
    return;
  }
  ctrlOwners.OwnerElementModel.findOwnerById(
    req.body.owner,
    function (err, doc) {
      if (err) {
        res.status(503);
        res.end();
        return;
      }

      if (doc == null) {
        //The owner does not exist
        res.status(422);
        res.write("Owner does not exist");
        res.end();
        return;
      }

      var newFile = {
        name: req.body.name,
        pages: req.body.pages,
        uploadDate: Date.now(),
        owner: new mongoose.mongo.ObjectId(req.body.owner),
        data: req.body.data,
      };

      FileElementModel.create(newFile, function (err, doc) {
        if (err) {
          res.status(503);
          res.end();
        } else {
          res.status(201);
          res.write(JSON.stringify(doc));
          res.end();
        }
      });
    }
  );
};

module.exports.getOneFile = function (req, res) {
  if (req.params.fileid == "undefined") {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }

  FileElementModel.findFileById(req.params.fileid, function (err, doc) {
    if (err) {
      res.status(503);
      res.end();
    } else {
      res.status(200);
      res.write(JSON.stringify(doc));
      res.end();
    }
  });
};

module.exports.getFilesByOwner = function (req, res) {
  if (req.params.ownerid == "undefined") {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }
  FileElementModel.findByOwner(req.params.ownerid, function (err, docs) {
    if (err) {
      res.status(503);
      res.end();
      return;
    }
    res.status(200);
    res.write(JSON.stringify(docs));
    res.end();
  });
};

module.exports.deleteFilesByOwner = function (req, res) {
  if (req.params.ownerid == "undefined") {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }
  FileElementModel.deleteFilesOnOwner(req.params.ownerid, function (err, doc) {
    if (err) {
      res.status(503);
      res.end();
    } else {
      res.status(204);
      res.write(JSON.stringify(doc));
      res.end();
    }
  });
};

module.exports.deleteOneFile = function (req, res) {
  if (req.params.fileid == "undefined") {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }
  FileElementModel.deleteFileById(req.params.fileid, function (err, doc) {
    if (err) {
      res.status(503);
      res.end();
    } else {
      res.status(204);
      res.end();
    }
  });
};

updateFile = function (req, res, id) {
  var updatedData = {};
  if (req.body.name) {
    updatedData.name = req.body.name;
  }
  if (req.body.pages) {
    updatedData.pages = req.body.pages;
  }
  if (req.body.owner) {
    updatedData.owner = req.body.owner;
  }
  if (req.body.data) {
    updatedData.data = req.body.data;
  }
  FileElementModel.updateFileById(id, updatedData, function (err, doc) {
    if (err) {
      res.status(503);
      res.end();
    } else {
      res.status(200);
      res.write(JSON.stringify(doc));
      res.end();
    }
  });
};

module.exports.updateOneFile = function (req, res) {
  //This function allows to update any field of the metadata of a file
  if (
    typeof req.params.fileid === "undefined" ||
    req.params.fileid == "undefined"
  ) {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }

  updateFile(req, res, req.params.fileid);
};

deleteFile = function(req,res,id) {
  FileElementModel.deleteFileById(id, function (err, doc) {
    if (err) {
      res.status(401);
      res.end();
      return;
    }

    fileSystemHelpers.deleteFileFromPath(
      req.params.fileid.toString(),
      fileSystemHelpers.PDF_SUFIX
    );

    fileSystemHelpers.deleteFileFromPath(
      req.params.fileid.toString(),
      fileSystemHelpers.PNG_SUFIX
    );

    res.status(204).json({
      message: "file deleted succesfully",
    });
    res.end();
  });
}

module.exports.deleteOneFile = function (req, res) {
  if (req.params.fileid == "undefined") {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }

  deleteFile(req,res,req.params.fileid);

};

module.exports.downloadFile = function (req, res) {
  path = "./uploads/" + req.params.fileid.toString() + ".pdf"; //path to file

  FileElementModel.findFileById(req.params.fileid, function (err, doc) {
    //Search for the file name in the model
    if (err) {
      res.status(401);
      res.end();
    } else {
      if (doc != null) {
        res.download(path, doc.name + ".pdf"); //Sets the response headers for the browser so the browser interprets it as a file to be downloaded
      } else {
        res.status(404);
        res.end();
      }
    }
  });
};

checkOwnership = function (req, res, nextStep) {
  if (
    typeof req.params.fileid === "undefined" ||
    req.params.fileid == "undefined"
  ) {
    res.status(400);
    res.write("The id was not specified");
    res.end();
    return;
  }

  ctrlOwners.OwnerElementModel.findOne(
    { email: req.decodedToken.email }, //obtain the owner of the email
    function (err, owner) {
      if (err) {
        res.status(401).json({
          message: "unable to fetch owner",
        });
        res.end();
        return;
      }
      FileElementModel.findFileById(req.params.fileid, function (err, file) {
        //obtain the file register
        if (err) {
          res.status(401).json({
            message: "unable to fetch file",
          });
          res.end();
          return;
        }
        if (!(owner && file)) {
          res.status(401).json({
            message: "Owner or file not found",
          });
          res.end();
          return;
        }
        if (!owner._id.equals(file.owner)) {
          //check if owner of the email is the same as the owner of the file (so the file cannot be touched by unauthorized user)

          res.status(401).json({
            message: "Authentication failed",
          });
          res.end();
          return;
        }

        nextStep(req, res);
      });
    }
  );
};

module.exports.user_deleteFile = function (req, res) {
  checkOwnership(req, res, function (req, res) {
    //the file can be deleted
    deleteFile(req,res,req.params.fileid);
  });
};

module.exports.user_updateFile = function (req, res) {
  //This function allows to update any field of the metadata of a file

  checkOwnership(req, res, function (req, res) {
    //the file can be modified

    updateFile(req, res, req.params.fileid);
  });
};

module.exports.user_downloadFile = function (req, res) {
  checkOwnership(req, res, function (req, res) {
    //the file can be sent to download

    path = "./uploads/" + req.params.fileid.toString() + ".pdf"; //path to file

    res.download(path, "download.pdf"); //Sets the response headers for the browser so the browser interprets it as a file to be downloaded
  });
};

module.exports.user_getFileInfo = function (req, res) {
  let email = req.decodedToken.email;

  ctrlOwners.OwnerElementModel.findOne({ email: email }, function (err, owner) {
    if (err) {
      res.status(401).json({
        message: "owner does not exist",
      });
    } else {
      FileElementModel.findFileById(req.params.fileid, function (err, file) {
        if (err) {
          res.status(401).json({
            message: "error fetching owner files",
          });
        } else {
          if (file.owner.equals(owner._id)) {
            res.status(201).json(file);
          } else {
            res.status(401).json({
              message: "error fetching owner files",
            });
          }
        }
      });
    }
  });
};

module.exports.user_getFilePreview = function (req, res) {
  checkOwnership(req, res, function (req, res) {
    //the file can be sent to download

    path = "./uploads/" + req.params.fileid.toString() + "_img.1.png"; //path to file

    res.download(path, "download.png"); //Sets the response headers for the browser so the browser interprets it as a file to be downloaded
  });
};
