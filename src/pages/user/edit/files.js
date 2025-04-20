//files.js
console.log("files.js chargé !");
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
  
  console.log(`DEBUG: Edit route accessed - website: ${websiteUuid}, file: ${fileName}`);
     console.log(`[DEBUG] GET /web/manage/${websiteUuid}/edit/${fileName}`); // Log de l'URL
  
  // Check if website exists and belongs to user
  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DATABASE ERROR:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      
      if (!website) {
        console.error(`Website not found: ${websiteUuid} for user: ${userId}`);
        return res.status(404).render("error/404.ejs");
      }
      
      // Define the storage directory for this website
      const websiteDir = path.join(
        __dirname,
        "../../../../storage/volumes",
        websiteUuid
      );
      
      // Make sure the website directory exists
      fs.mkdir(websiteDir, { recursive: true }, (err) => {
        if (err && err.code !== 'EEXIST') {
          console.error(`Error creating directory: ${websiteDir}`, err);
          return res.status(500).render("error/500.ejs");
        }
        
        const filePath = path.join(websiteDir, fileName);
        console.log(`Looking for file at: ${filePath}`);
        
        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          // If file doesn't exist and this isn't a new file request, show error
          if (err) {
            console.error(`File not found: ${filePath}`);
            
            // If it's a new file, create an empty one
            if (req.query.new === 'true') {
              console.log(`Creating new file: ${filePath}`);
              fs.writeFile(filePath, '', 'utf8', (err) => {
                if (err) {
                  console.error(`Error creating new file: ${filePath}`, err);
                  return res.status(500).render("error/500.ejs");
                }
                
                // Render the editor with empty content
                return res.render("web/edit/files.ejs", {
                  user: req.session.user,
                  websiteUuid,
                  fileName,
                  fileContent: '',
                  website,
                  appName: process.env.APP_NAME || "Web File Manager"
                });
              });
            } else {
              // File doesn't exist and not creating new one
              return res.status(404).render("error/404.ejs", {
                message: `File '${fileName}' not found`
              });
            }
            return;
          }
          
          // File exists, read it
          fs.readFile(filePath, "utf8", (err, fileContent) => {
            if (err) {
              console.error(`Error reading file: ${filePath}`, err);
              return res.status(500).render("error/500.ejs");
            }
            
            // Render the editor with file content
            res.render("web/edit/files.ejs", {
              user: req.session.user,
              websiteUuid,
              fileName,
              fileContent,
              website,
              appName: process.env.APP_NAME || "Web File Manager"
            });
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
  
  console.log(`DEBUG: Save route accessed - website: ${websiteUuid}, file: ${fileName}`);
  
  // Check if content is provided
  if (fileContent === undefined) {
    console.error("No content provided in request body");
    return res.status(400).send("No content provided");
  }
  
  // Check if website exists and belongs to user
  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DATABASE ERROR:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      
      if (!website) {
        console.error(`Website not found: ${websiteUuid} for user: ${userId}`);
        return res.status(404).render("error/500.ejs");
      }
      
      // Define the file path
      const websiteDir = path.join(
        __dirname,
        "../../../../storage/volumes",
        websiteUuid
      );
      
      // Ensure directory exists
      fs.mkdir(websiteDir, { recursive: true }, (err) => {
        if (err && err.code !== 'EEXIST') {
          console.error(`Error creating directory: ${websiteDir}`, err);
          return res.status(500).render("error/500.ejs");
        }
        
        const filePath = path.join(websiteDir, fileName);
        
        // Save the file
        fs.writeFile(filePath, fileContent, "utf8", (err) => {
          if (err) {
            console.error(`Error writing file: ${filePath}`, err);
            return res.status(500).render("error/500.ejs");
          }
          
          console.log(`File saved successfully: ${filePath}`);
          // Redirect to management page
          res.redirect(`/web/manage/${websiteUuid}`);
        });
      });
    }
  );
});

module.exports = router;
