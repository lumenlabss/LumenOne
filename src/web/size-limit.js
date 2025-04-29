console.log("size-limit.js loaded"); // To confirm that the page has been loaded correctly
const db = require("../db.js");
const fs = require("fs");
const path = require("path");

// Function to calculate the size of a folder
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

// Checks if creating a file will exceed the disk limit
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

      // Check if the folder exists
      if (!fs.existsSync(folderPath)) {
        return callback(new Error("Directory not found"));
      }

      // Calculate the current used size of the folder
      const usedSize = getFolderSize(folderPath);

      // If adding the file exceeds the limit
      if (usedSize + fileSize > diskLimitBytes) {
        return callback(new Error("Disk limit exceeded, cannot create file"));
      }

      // If passed the check, the file can be created
      callback(null);
    }
  );
}

module.exports = {
  checkSizeBeforeCreate,
};
