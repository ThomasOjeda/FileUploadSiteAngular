var express = require("express");
var router = express.Router();
var ctrlFiles = require("../controllers/files");
var ctrlOwners = require("../controllers/owners");
var checkAuthentication = require("../middleware/authentication");
var checkAdminAccess = require ("../middleware/adminAccess");
var adminUploadManager = require("../middleware/adminFileUpload");

///ADMINISTRATIVE ROUTES

//File database CRUD
router.get("/files", checkAuthentication, checkAdminAccess, ctrlFiles.getAllFiles);
router.post("/files", checkAuthentication, checkAdminAccess, ctrlFiles.createFileMetadata); //Create file metadata (will provoke inconsistency)
router.get("/files/:fileid", checkAuthentication, checkAdminAccess, ctrlFiles.getOneFile);
router.get("/files/owner/:ownerid", checkAuthentication, checkAdminAccess, ctrlFiles.getFilesByOwner);
router.delete("/files/:fileid", checkAuthentication, checkAdminAccess, ctrlFiles.deleteOneFile); //Delete file metadata only (will provoke inconsistency)
router.put("/files/:fileid", checkAuthentication, checkAdminAccess, ctrlFiles.updateOneFile);
router.delete("/files/owner/:ownerid", checkAuthentication, checkAdminAccess, ctrlFiles.deleteFilesByOwner);

//File creation with file upload
router.post(
  "/files/upload", checkAuthentication, checkAdminAccess,
  adminUploadManager,
  ctrlFiles.uploadFile
);

//File deletion with file removal
router.delete("/files/upload/:fileid", checkAuthentication, checkAdminAccess, ctrlFiles.deleteOneFile);

//Dowload a file
router.get("/files/download/:fileid", checkAuthentication, checkAdminAccess, ctrlFiles.downloadFile);

//Owner database CRUD
router.get("/owners", checkAuthentication, checkAdminAccess, ctrlOwners.getAllOwners);
/* router.post("/owners", checkAuthentication, checkAdminAccess, ctrlOwners.createOwner); */
router.get("/owners/:ownerid", checkAuthentication, checkAdminAccess, ctrlOwners.getOneOwner);
router.delete("/owners/:ownerid", checkAuthentication, checkAdminAccess, ctrlOwners.deleteOneOwnerConsistently);
router.put("/owners/:ownerid", checkAuthentication, checkAdminAccess, ctrlOwners.updateOneOwner);

module.exports = router;
