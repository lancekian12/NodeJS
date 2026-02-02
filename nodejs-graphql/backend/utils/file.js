const path = require("path");
const fs = require("fs");

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("File already deleted or does not exist:", filePath);
        return;
      }
      console.error(err);
    } else {
      console.log("File deleted:", filePath);
    }
  });
};

exports.clearImage = clearImage;
