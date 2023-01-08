var express = require("express");
var checkAuthentication = require("../middleware/authentication")
var ctrlOwners = require("../controllers/owners")
var ctrlFiles = require("../controllers/files")
var userUploadManager = require("../middleware/userFileUpload")

var router = express.Router();

router.get("/owner",checkAuthentication, ctrlOwners.user_getOwnerInfo);

router.get("/files/:fileid",checkAuthentication,ctrlFiles.user_getFileInfo);
router.get("/files/:fileid/preview", checkAuthentication , ctrlFiles.user_getFilePreview);
router.get("/files",checkAuthentication, ctrlOwners.user_getOwnerFiles);
router.put("/owner",checkAuthentication, ctrlOwners.user_updateOwner); 
router.post("/file",checkAuthentication, userUploadManager, ctrlFiles.uploadFile);
router.delete("/file/:fileid",checkAuthentication, ctrlFiles.user_deleteFile);
router.put("/file/:fileid",checkAuthentication, ctrlFiles.user_updateFile);
router.get("/file/download/:fileid", checkAuthentication, ctrlFiles.user_downloadFile);

module.exports = router;
