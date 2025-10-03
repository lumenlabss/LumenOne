// console.log("protect-sensitive-files.js loaded");
const path = require("path");
const fs = require("fs");

const protectedFiles = ["php.ini"];
function protectSensitiveFiles(baseDir) {
  return (req, res, next) => {
    const fileName = path.basename(req.path); // "php.ini"
    const match = req.path.match(/\/web\/manage\/([^/]+)/);
    if (!match) {
      console.log("[MIDDLEWARE] No detected UUID, Skipping");
      return next();
    }

    const websiteUuid = match[1];
    const requestedPath = path.join(baseDir, websiteUuid, fileName);

    console.log("[MIDDLEWARE] Checking file:", requestedPath);

    if (protectedFiles.includes(fileName)) {
      fs.stat(requestedPath, (err, stats) => {
        if (!err && stats.isFile()) {
          console.log("[MIDDLEWARE] BLOCKED:", requestedPath);
          return res
            .status(403)
            .send(
              "Error 403 - Access Denied. It is an error on your side, don't make an issue report on github."
            );
        }
        next();
      });
    } else {
      next();
    }
  };
}

module.exports = { protectSensitiveFiles };
