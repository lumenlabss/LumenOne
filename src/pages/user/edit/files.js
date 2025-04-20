const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../../../db.js");
const router = express.Router();

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Route to display the file editor
router.get("/web/manage/:id/edit/:file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const fileName = req.params.file;
  console.log(
    `Debug: Attempting to access the editor for website ${websiteUuid}, file ${fileName}`
  );

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DB Error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      
      if (!website) {
        console.log("Debug: No site found for this UUID and user");
        return res.status(404).render("error/404.ejs");
      }
      
      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        fileName
      );
      console.log(`Debug: Constructing file path: ${filePath}`);
      
      // Check if the file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("File does not exist:", err.message);
          return res.status(404).render("error/404.ejs");
        }
        
        // File exists, read its content
        fs.readFile(filePath, "utf8", (err, fileContent) => {
          if (err) {
            console.error("File read error:", err.message);
            return res.status(500).render("error/500.ejs");
          }
          
          console.log("Debug: File successfully read, displaying in editor");
          // Display file content in the editor
          res.render("web/edit/files.ejs", {
            user: req.session.user,
            websiteUuid,
            fileName,
            fileContent,
            website // Pass website data to the template
          });
        });
      });
    }
  );
});

// Route to save file changes
router.post("/web/manage/:id/edit/:file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const fileName = req.params.file;
  const fileContent = req.body.content;
  
  if (!fileContent) {
    return res.status(400).json({ error: "No content provided" });
  }
  
  console.log(`Debug: Saving changes for ${websiteUuid}, file ${fileName}`);
  
  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DB Error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      
      if (!website) {
        console.log("Debug: No site found for this UUID and user");
        return res.status(404).render("error/404.ejs");
      }
      
      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        fileName
      );
      console.log(`Debug: Constructing file path for saving: ${filePath}`);
      
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Directory creation error:", err.message);
          return res.status(500).render("error/500.ejs");
        }
        
        // Save changes to the file
        fs.writeFile(filePath, fileContent, "utf8", (err) => {
          if (err) {
            console.error("File write error:", err.message);
            return res.status(500).render("error/500.ejs");
          }
          
          console.log("Debug: File successfully saved");
          // Redirect to management page
          res.redirect(`/web/manage/${websiteUuid}`);
        });
      });
    }
  );
});

module.exports = router;
