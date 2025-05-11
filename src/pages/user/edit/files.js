console.log("pages/user/edit/files.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../../../db.js");
const router = express.Router();
const { checkSizeBeforeCreate } = require("../../../web/size-limit.js");
const app = express();
const { isAuthenticated } = require("../../../middleware/auth.js");
const {
  protectSensitiveFiles,
} = require("../../../middleware/protect-sensitive-files.js"); // Import du middleware correct
app.use(express.json({ limit: "80mb" }));
app.use(express.urlencoded({ limit: "80mb", extended: true }));

// Function to calculate the total size of a folder
function getFolderSize(folderPath, callback) {
  let totalSize = 0;

  const walk = (dir) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, { withFileTypes: true }, async (err, entries) => {
        if (err) return reject(err);

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
          }
        }
        resolve();
      });
    });
  };

  walk(folderPath)
    .then(() => callback(null, totalSize))
    .catch((err) => callback(err));
}

// Helper function to get the volume directory path (avoids repetition)
function getVolumesDir() {
  return path.join(__dirname, "../../../../storage/volumes");
}

// Route to display the file editor
router.get(
  "/web/manage/:id/edit/:file",
  isAuthenticated,
  protectSensitiveFiles(getVolumesDir()), // Utilise le helper pour éviter la répétition
  (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;

    console.log(
      `DEBUG: Edit route accessed - website: ${websiteUuid}, file: ${fileName}`
    );

    db.get(
      "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
      [websiteUuid, userId],
      (err, website) => {
        if (err) {
          console.error("DATABASE ERROR:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        if (!website) {
          console.error(
            `Website not found: ${websiteUuid} for user: ${userId}`
          );
          return res.status(404).render("error/404.ejs");
        }

        const websiteDir = path.join(getVolumesDir(), websiteUuid); // Utilise le helper

        db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) {
            console.error("Error recovering rank:", err.message);
            return res.status(500).render("error/500.ejs");
          }

          fs.mkdir(websiteDir, { recursive: true }, (err) => {
            if (err && err.code !== "EEXIST") {
              console.error(`Error creating directory: ${websiteDir}`, err);
              return res.status(500).render("error/500.ejs");
            }

            const filePath = path.join(websiteDir, fileName);
            console.log(`Looking for file at: ${filePath}`);

            fs.access(filePath, fs.constants.F_OK, (err) => {
              if (err) {
                console.error(`File not found: ${filePath}`);

                if (req.query.new === "true") {
                  console.log(`Creating new file: ${filePath}`);

                  // Calculate file size and check disk space
                  const fileSize = 0; // size of the file, here 0 for an empty file
                  checkSizeBeforeCreate(websiteUuid, fileSize, (err) => {
                    if (err) {
                      console.error("Disk limit exceeded: ", err.message);
                      return res.render("web/edit/files.ejs", {
                        user: req.session.user,
                        error: err.message, // Sends error to view
                        websiteUuid,
                        fileName,
                        fileContent: "",
                        website,
                      });
                    }

                    fs.writeFile(filePath, "", "utf8", (err) => {
                      if (err) {
                        console.error(
                          `Error creating new file: ${filePath}`,
                          err
                        );
                        return res.status(500).render("error/500.ejs");
                      }

                      return res.render("web/edit/files.ejs", {
                        user: req.session.user,
                        rank: row ? row.rank : null,
                        error: null,
                        websiteUuid,
                        fileName,
                        fileContent: "",
                        website,
                      });
                    });
                  });
                } else {
                  return res.status(404).render("error/404.ejs", {
                    message: `File '${fileName}' not found`,
                  });
                }
                return;
              }

              fs.readFile(filePath, "utf8", (err, fileContent) => {
                if (err) {
                  console.error(`Error reading file: ${filePath}`, err);
                  return res.status(500).render("error/500.ejs");
                }

                res.render("web/edit/files.ejs", {
                  user: req.session.user,
                  rank: row ? row.rank : null,
                  error: null,
                  websiteUuid,
                  fileName,
                  fileContent,
                  website,
                });
              });
            });
          });
        });
      }
    );
  }
);

// Route to save file changes
router.post(
  "/web/manage/:id/edit/:file",
  isAuthenticated,
  protectSensitiveFiles(getVolumesDir()), // Utilise le helper pour éviter la répétition
  (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;
    const fileContent = req.body.content;

    console.log(
      `DEBUG: Save route accessed - website: ${websiteUuid}, file: ${fileName}`
    );

    if (fileContent === undefined) {
      console.error("No content provided in request body");
      return res.status(400).send("No content provided");
    }

    db.get(
      "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
      [websiteUuid, userId],
      (err, website) => {
        if (err) {
          console.error("DATABASE ERROR:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        if (!website) {
          console.error(
            `Website not found: ${websiteUuid} for user: ${userId}`
          );
          return res.status(404).render("error/500.ejs");
        }

        const websiteDir = path.join(getVolumesDir(), websiteUuid); // Utilise le helper

        fs.mkdir(websiteDir, { recursive: true }, (err) => {
          if (err && err.code !== "EEXIST") {
            console.error(`Error creating directory: ${websiteDir}`, err);
            return res.status(500).render("error/500.ejs");
          }

          const filePath = path.join(websiteDir, fileName);

          // Calculate file size to be added and check the size
          const fileSize = Buffer.byteLength(fileContent, "utf8"); // Calculate content size in bytes
          checkSizeBeforeCreate(websiteUuid, fileSize, (err) => {
            if (err) {
              console.error("Disk limit exceeded: ", err.message);

              // Pass error to the view
              return res.render("web/edit/files.ejs", {
                user: req.session.user,
                error: err.message, // Send error message to view
                websiteUuid,
                fileName,
                fileContent,
                website,
              });
            }

            fs.writeFile(filePath, fileContent, "utf8", (err) => {
              if (err) {
                console.error(`Error writing file: ${filePath}`, err);
                return res.status(500).render("error/500.ejs");
              }

              console.log(`File saved successfully: ${filePath}`);
              res.redirect(`/web/manage/${websiteUuid}`);
            });
          });
        });
      }
    );
  }
);

// Route to get the total size of the website's folder
router.get(
  "/web/manage/:id/size",
  isAuthenticated,
  protectSensitiveFiles(getVolumesDir()),
  (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;

    console.log(`[DEBUG] GET /web/manage/${websiteUuid}/size`);

    db.get(
      "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
      [websiteUuid, userId],
      (err, website) => {
        if (err) {
          console.error("DATABASE ERROR:", err.message);
          return res.status(500).json({ error: "Database error" });
        }

        if (!website) {
          console.error(
            `Website not found: ${websiteUuid} for user: ${userId}`
          );
          return res.status(404).json({ error: "Website not found" });
        }

        const websiteDir = path.join(getVolumesDir(), websiteUuid);

        getFolderSize(websiteDir, (err, size) => {
          if (err) {
            console.error(`Error getting folder size:`, err);
            return res.status(500).json({ error: "Failed to get folder size" });
          }

          res.json({ size }); // returns { size: 123456 } (in bytes)
        });
      }
    );
  }
);

module.exports = router;
