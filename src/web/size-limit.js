const db = require("../db.js");
const fs = require("fs");
const path = require("path");

// Fonction pour calculer la taille d'un dossier
function getFolderSize(folderPath) {
  let totalSize = 0;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    }
  }

  return totalSize;
}

// Fonction principale pour vérifier la limite
function checkSizeLimit(websiteUuid, callback) {
  db.get(
    "SELECT disk_limit FROM websites WHERE uuid = ?",
    [websiteUuid],
    (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        return callback(err);
      }

      if (!row) {
        return callback(new Error("Site non trouvé."));
      }

      const diskLimitBytes = row.disk_limit * 1024 * 1024; // MB -> Bytes
      const folderPath = path.join(
        __dirname,
        "../../storage/volumes",
        websiteUuid
      );

      if (!fs.existsSync(folderPath)) {
        return callback(new Error("Files not found."));
      }

      const usedSize = getFolderSize(folderPath);
      const status = usedSize <= diskLimitBytes ? "OK" : "LIMIT_EXCEEDED";

      callback(null, {
        uuid: websiteUuid,
        disk_limit_mb: row.disk_limit,
        used_mb: (usedSize / 1024 / 1024).toFixed(2),
        status: status,
      });
    }
  );
}

module.exports = {
  checkSizeLimit,
};
