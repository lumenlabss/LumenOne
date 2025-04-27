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

// Vérifie si la création d'un fichier dépasse la limite du disque
function checkSizeBeforeCreate(websiteUuid, fileSize, callback) {
  db.get(
    "SELECT disk_limit FROM websites WHERE uuid = ?",
    [websiteUuid],
    (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        return callback(err);
      }

      if (!row) {
        return callback(new Error("Website not found"));
      }

      const diskLimitBytes = row.disk_limit * 1024 * 1024; // MB -> Bytes
      const folderPath = path.join(
        __dirname,
        "../../storage/volumes",
        websiteUuid
      );

      // Vérifie si le dossier existe
      if (!fs.existsSync(folderPath)) {
        return callback(new Error("Directory not found"));
      }

      // Calculer la taille utilisée actuelle du dossier
      const usedSize = getFolderSize(folderPath);

      // Si l'ajout du fichier dépasse la limite
      if (usedSize + fileSize > diskLimitBytes) {
        return callback(new Error("Disk limit exceeded, cannot create file"));
      }

      // Si on passe la vérification, on peut créer le fichier
      callback(null);
    }
  );
}

module.exports = {
  checkSizeBeforeCreate,
};
