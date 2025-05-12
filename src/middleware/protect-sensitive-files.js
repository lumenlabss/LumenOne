const path = require("path");
const fs = require("fs");

const protectedFiles = ["php.ini"];

function protectSensitiveFiles(baseDir) {
  const basePath = path.resolve(baseDir);

  return (req, res, next) => {
    const decodedPath = decodeURIComponent(req.path);
    const normalizedPath = path.normalize(decodedPath);
    const requestedPath = path.join(basePath, normalizedPath);

    // Assure que le chemin est bien dans le dossier de base
    if (!requestedPath.startsWith(basePath)) {
      return res.status(403).send("Access denied.");
    }

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

