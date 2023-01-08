const mongoose = require("mongoose");
var databaseData = require("../mongoose/mongooseSchema");
var ctrlFiles = require("../controllers/files");
var fs = require("fs");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var OwnerElementModel = mongoose.model(
  "owners",
  databaseData.OwnerSchema,
  "owners"
);

exports.OwnerElementModel = OwnerElementModel;

module.exports.getAllOwners = function (req, res) {
  OwnerElementModel.findAllOwners(function (err, documents) {
    if (err) {
      res.status(404);
      res.end();
      return;
    }
    res.status(201);
    res.write(JSON.stringify(documents));
    res.end();
  });
};

module.exports.signup = function (req, res) {
  if (!(req.body.email && req.body.password)) {
    res.status(400).json({
      message: "Some parameters were not specified",
    });

    return;
  }

  OwnerElementModel.findOne({ email: req.body.email }, function (err, owner) {
    if (owner) {
      res.status(409).json({
        message: "email already exists",
      });
      return;
    }

    //Generate a hash to avoid storing the password in plain text
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      if (err) {
        res.status(500).json({ error: err });

        return;
      }

      var newOwner = {
        email: req.body.email,
        password: hash,

        creationDate: Date.now(),
      };

      //The following are optional signup parameters
      if (req.body.name) newOwner.name = req.body.name;
      if (req.body.organization) newOwner.organization = req.body.organization;
      if (req.body.description) newOwner.description = req.body.description;

      OwnerElementModel.create(newOwner, function (err, doc) {
        if (err) {
          res.status(401);
          res.end();
          return;
        }
        res.status(201).json({
          message: "email and password registered succesfully",
        });
        res.end();
      });
    });
  });
};

module.exports.login = function (req, res) {
  if (!(req.body.email && req.body.password)) {
    res.status(400).json({
      message: "Some parameters were not specified",
    });
    return;
  }

  OwnerElementModel.findOne({ email: req.body.email }, function (err, doc) {
    if (err) {
      res.status(401);
      res.end();
      return;
    }
    if (doc) {
      bcrypt.compare(req.body.password, doc.password, function (err, result) {
        if (err || !result) {
          res.status(401).json({
            message: "Authentication failed",
          });
          return;
        }
        token = jwt.sign(
          {
            email: doc.email,
            ownerId: doc._id,
          },
          "sEcReT KeY",
          {
            expiresIn: "1h",
          }
        );

        res.status(200).json({
          message: "Authentication succesfull",
          token: token,
        });
        return;
      });
      return;
    }
    res.status(401).json({
      message: "Authentication failed",
    });
  });
};

module.exports.getOneOwner = function (req, res) {
  if (!req.params.ownerid) {
    res.status(401);
    res.end();
    return;
  }

  OwnerElementModel.findOwnerById(req.params.ownerid, function (err, doc) {
    if (err) {
      res.status(401);
      res.end();
      return;
    }
    res.status(201);
    res.write(JSON.stringify(doc));
    res.end();
  });
};

// Only deletes the owner and does not consider its files
module.exports.deleteOneOwner = function (req, res) {
  if (!req.params.ownerid) {
    res.status(400);
    res.end();
    return;
  }
  OwnerElementModel.deleteOwnerById(req.params.ownerid, function (err, doc) {
    if (err) {
      res.status(400);
      res.end();
      return;
    }
    res.status(204);
    res.end();
  });
};

// Deletes the owner and its files
module.exports.deleteOneOwnerConsistently = function (req, res) {
  if (!req.params.ownerid) {
    res.status(401);
    res.end();
    return;
  }
  ctrlFiles.FileElementModel.findByOwner(
    req.params.ownerid,
    function (err, documents) {
      if (err) {
        res.status(404);
        res.end();
        return;
      }
      idArray = [];
      documents.forEach((document) => {
        idArray.push(document._id.toString());
      });

      ctrlFiles.FileElementModel.deleteFilesOnOwner(
        req.params.ownerid,
        function (err, doc) {
          if (err) {
            res.status(401);
            res.write("mongoose_deletefilessbyowner_failed");
            res.end();
            return;
          }
          OwnerElementModel.deleteOwnerById(
            req.params.ownerid,
            function (err, doc) {
              if (err) {
                res.status(401);
                res.write("mongoose_deleteowner_failed");
                res.end();
                return;
              }

              idArray.forEach(function (id) {
                fs.unlink("./uploads/" + id + ".pdf", function (err) {
                  if (err) {
                    console.log(
                      "warning:file " +
                        "./uploads/" +
                        id +
                        ".pdf" +
                        " was not deleted"
                    );
                  }
                });
              });

              idArray.forEach(function (id) {
                fs.unlink("./uploads/" + id + "_img.1.png", function (err) {
                  if (err) {
                    console.log(
                      "warning:file " +
                        "./uploads/" +
                        id +
                        "_img.1.png" +
                        " was not deleted"
                    );
                  }
                });
              });

              res.status(204);
              res.write("All files deleted");
              res.end();
            }
          );
        }
      );
    }
  );
};

updateOwner = function (req, res, idToLookFor) {
  var updatedData = {};
  if (req.body.name) {
    updatedData.name = req.body.name;
  }
  if (req.body.organization) {
    updatedData.organization = req.body.organization;
  }
  if (req.body.description) {
    updatedData.description = req.body.description;
  }

  OwnerElementModel.updateOwnerById(
    idToLookFor,
    updatedData,
    function (err, doc) {
      if (err) {
        res.status(401);
        res.end();
        return;
      }
      res.status(201).json({
        message: "owner updated succesfully",
        newInfo: doc,
      });
      res.end();
    }
  );
};

module.exports.updateOneOwner = function (req, res) {
  if (!req.params.ownerid) {
    res.status(401);
    res.end();
    return;
  }

  //To allow email modification we have to check for email duplicates

  updateOwner(req, res, req.params.ownerid);
};

module.exports.user_getOwnerInfo = function (req, res) {
  let email = req.decodedToken.email;

  OwnerElementModel.findOne({ email: email }, function (err, doc) {
    if (err) {
      res.status(401).json({
        message: "owner does not exist",
      });
      return;
    }
    response = {
      email: doc.email,
      name: doc.name,
      organization: doc.organization,
      description: doc.description,
      creationDate: doc.creationDate,
    };
    res.status(201).json(response);
  });
};

module.exports.user_getOwnerFiles = function (req, res) {
  let email = req.decodedToken.email;

  OwnerElementModel.findOne({ email: email }, function (err, doc) {
    if (err) {
      res.status(401).json({
        message: "owner does not exist",
      });
      return;
    }
    if (doc) {
      ctrlFiles.FileElementModel.findByOwner(doc._id, function (err, docs) {
        if (err) {
          res.status(401).json({
            message: "error fetching owner files",
          });
          return;
        }
        res.status(201).json(docs);
      });
      return;
    }
    res.status(401).json({
      message: "file does not exist",
    });
  });
};

module.exports.user_updateOwner = function (req, res) {
  let email = req.decodedToken.email;

  OwnerElementModel.findOne({ email: email }, function (err, doc) {
    if (err) {
      res.status(401).json({
        message: "cannot fetch owner",
      });
      return;
    }
    if (doc) {
      //To allow email modification we have to check for email duplicates

      updateOwner(req, res, doc._id);

      return;
    }
    res.status(401).json({
      message: "owner does not exist",
    });
  });
};
