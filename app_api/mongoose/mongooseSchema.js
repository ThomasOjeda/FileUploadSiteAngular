//This script contains all the characteristics of the schema of the database

const mongoose = require("mongoose");
const dbName = "bibliography";
const fileCollectionName = "inventory";
const ownerCollectionName = "owners";

const url = "mongodb://Thomas:pwd@localhost:27017/" + dbName;

var Schema = mongoose.Schema;

// <<<<---- FILE SCHEMA ---->>>> //

var FileSchema = new Schema({
  name: String,
  pages: Number,
  uploadDate: { type: Date, default: Date.now },
  owner: mongoose.Types.ObjectId,
  data: String,
});

FileSchema.statics.findByOwner = function (searchParameter, callback) {
  objectIdToDelete = new mongoose.mongo.ObjectId(searchParameter);
  mongoose
    .model(fileCollectionName)
    .find({ owner: objectIdToDelete }, function (err, documents) {
      callback(err, documents);
    });
};

FileSchema.statics.findAllFiles = function (callback) {
  mongoose.model(fileCollectionName).find({}, function (err, documents) {
    callback(err, documents);
  });
};

FileSchema.statics.findFileById = function (id, callback) {
  mongoose.model(fileCollectionName).findById(id, function (err, doc) {
    callback(err, doc);
  });
};

FileSchema.statics.deleteFileById = function (id, callback) {
  objectIdToDelete = new mongoose.mongo.ObjectId(id);
  mongoose
    .model(fileCollectionName)
    .deleteOne({ _id: objectIdToDelete }, function (err, doc) {
      callback(err, doc);
    });
};

FileSchema.statics.updateFileById = function (id, updatedData, callback) {
  objectIdToUpdate = new mongoose.mongo.ObjectId(id);
  mongoose.model(fileCollectionName).updateOne(
    {
      _id: objectIdToUpdate,
    },
    updatedData,
    function (err, result) {
      callback(err, result);
    }
  );
};

FileSchema.statics.updateDataOnOwner = function (uOwner, uData, callback) {
  uData.owner = new mongoose.mongo.ObjectId(uData.owner);
  mongoose.model(fileCollectionName).updateMany(
    {
      owner: new mongoose.mongo.ObjectId(uOwner),
    },
    { $set: { data: uData } },
    function (err, result) {
      callback(err, result);
    }
  );
};

FileSchema.statics.deleteFilesOnOwner = function (dOwner, callback) {
  mongoose.model(fileCollectionName).deleteMany(
    {
      owner: new mongoose.mongo.ObjectId(dOwner),
    },
    function (err, result) {
      callback(err, result);
    }
  );
};

FileSchema.methods.findOnSameOwner = function (callback) {
  mongoose
    .model(fileCollectionName)
    .find({ owner: this.owner }, function (err, result) {
      callback(err, result);
    });
};

FileSchema.methods.deleteOnSameOwner = function (callback) {
  mongoose
    .model(fileCollectionName)
    .deleteMany({ owner: this.owner }, function (err, result) {
      callback(err, result);
    });
};

// <<<<---- OWNER SCHEMA ---->>>> //

var OwnerSchema = new Schema({
  email: {type: String, required:true},
  password : {type: String, required: true},
  name: String,
  creationDate: { type: Date, default: Date.now },
  organization: String,
  description: String,
});

OwnerSchema.statics.findOwnerById = function (id, callback) {
  mongoose.model(ownerCollectionName).findById(id, function (err, doc) {
    callback(err, doc);
  });
};

OwnerSchema.statics.findAllOwners = function (callback) {
  mongoose.model(ownerCollectionName).find({}, function (err, documents) {
    callback(err, documents);
  });
};

OwnerSchema.statics.deleteOwnerById = function (id, callback) {
  objectIdToDelete = new mongoose.mongo.ObjectId(id);
  mongoose
    .model(ownerCollectionName)
    .deleteOne({ _id: objectIdToDelete }, function (err, doc) {
      callback(err, doc);
    });
};

OwnerSchema.statics.updateOwnerById = function (id, updatedData, callback) {
  objectIdToUpdate = new mongoose.mongo.ObjectId(id);
  mongoose.model(ownerCollectionName).updateOne(
    {
      _id: objectIdToUpdate,
    },
    updatedData,
    function (err, result) {
      callback(err, result);
    }
  );
};

// <<<<---- USER SCHEMA ---->>>> //

var UserSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true}
});


module.exports = { dbName, url, FileSchema, OwnerSchema, UserSchema };
