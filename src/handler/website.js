const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Configures a site to be accessible on a specific port.
function configureSitePort(sitePath, port) {
  app.use(express.static(sitePath));
  app.listen(port, () => {
    console.log(`A new website created, Port: ${port}`); // Debug
  });
}

// Creates a folder for a site with a default index.html file.
function createSiteFolder(sitePath, diskLimit) {
  try {
    if (!diskLimit) {
      throw new Error("Disk limit is not defined");
    }

    fs.mkdirSync(sitePath, { recursive: true });

    // Create a .disk_limit file with the specified limit
    fs.writeFileSync(path.join(sitePath, ".disk_limit"), diskLimit.toString());

    // Create a default index.html file
    const indexContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body>
        <h1>Welcome to your new website!</h1>
        <p>Modify this file from the admin panel.</p>
      </body>
      </html>
    `;
    fs.writeFileSync(path.join(sitePath, "index.html"), indexContent);
  } catch (err) {
    console.error(`Error creating site folder at ${sitePath}:`, err.message);
  }
}

// Check the total disk usage of a site folder
function checkDiskUsage(sitePath) {
  const files = fs.readdirSync(sitePath);
  let totalSize = 0;

  files.forEach((file) => {
    const filePath = path.join(sitePath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  });

  return totalSize;
}

// Check if the disk limit is exceeded
function isDiskLimitExceeded(sitePath) {
  const diskLimitPath = path.join(sitePath, ".disk_limit");
  if (!fs.existsSync(diskLimitPath)) {
    return false; // No limit defined
  }

  const diskLimit = parseInt(fs.readFileSync(diskLimitPath, "utf8"), 10);
  const currentUsage = checkDiskUsage(sitePath);

  return currentUsage > diskLimit;
}

module.exports = {
  configureSitePort,
  createSiteFolder,
  checkDiskUsage,
  isDiskLimitExceeded,
};
