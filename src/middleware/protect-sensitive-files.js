const path = require("path");
const fs = require("fs");

const protectedFiles = ["php.ini"];

function protectSensitiveFiles(baseDir) {
  return (req, res, next) => {
    const normalizedPath = path.normalize(req.path);
    const requestedPath = path.join(baseDir, normalizedPath);

    const isProtected = protectedFiles.some((filename) =>
      requestedPath.endsWith(filename)
    );

    if (isProtected) {
      fs.stat(requestedPath, (err, stats) => {
        if (!err && stats.isFile()) {
          return res.status(403).send("Access denied to protected file.");
        }
        next();
      });
    } else {
      next();
    }
  };
}

module.exports = { protectSensitiveFiles };
