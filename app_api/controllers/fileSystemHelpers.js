var fs = require("fs");
var pdf2pic = require("pdf2pic");

var prefix = "./uploads";

const IMAGE_FORMAT = "png";
const PDF_SUFIX = ".pdf";
const PNG_SUFIX = "_img.1."+IMAGE_FORMAT;

deleteFileFromPath = function(filename,sufix) {
    fs.unlink(
        prefix + "/" + filename + sufix,
        function (fserr) {
          if (fserr) {
            console.log(
              "warning:file " + prefix+ "/" + filename + sufix + " was not deleted"
            );
          }
        }
      );
}

savePDFPreviewImage = function(filename) {
    let options = {
        density: 75,
        saveFilename: filename + "_img",
        savePath: prefix,
        format: IMAGE_FORMAT,
        width: 200,
        height: 250,
      };
    
      let storeAsImage = pdf2pic.fromPath(
        prefix + "/" + filename + PDF_SUFIX,
        options
      );
    
      storeAsImage(1).then((resolve) => {
        //I believe it doesnt really matter if the image is still getting saved
        return resolve;
      });
}


module.exports = {deleteFileFromPath, savePDFPreviewImage, PDF_SUFIX,PNG_SUFIX};
