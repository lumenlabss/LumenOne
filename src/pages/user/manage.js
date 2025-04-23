const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Website management page route
router.get("/web/manage/:id", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DB error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      if (!website) {
        return res.status(404).render("error/404.ejs");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Error retrieving rank:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        const filesPath = path.join(
          __dirname,
          "../../../storage/volumes",
          websiteUuid
        );

        fs.readdir(filesPath, (err, fileList) => {
          if (err) {
            console.error("Error reading directory:", err.message);
            return res.status(500).render("error/500.ejs");
          }

          const files = fileList.map((fileName) => {
            const fileFullPath = path.join(filesPath, fileName);
            const stats = fs.statSync(fileFullPath);
            return {
              name: fileName,
              size: (stats.size / 1024 / 1024).toFixed(2),
            };
          });

          res.render("web/manage.ejs", {
            user: req.session.user,
            website,
            rank: row ? row.rank : null,
            websiteUuid,
            files,
          });
        });
      });
    }
  );
});

// Create file route
router.post("/web/manage/:id/create-file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const filename = req.body.filename;

  // Basic security check
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.length > 100
  ) {
    return res.status(400).send("Invalid file name.");
  }

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DB error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      if (!website) {
        return res.status(404).render("error/404.ejs");
      }

      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        filename
      );

      fs.writeFile(filePath, "", (err) => {
        if (err) {
          console.error("File creation error:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        res.redirect(`/web/manage/${websiteUuid}`);
      });
    }
  );
});

// File deletion route
router.get("/web/manage/:id/delete/:file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const fileToDelete = req.params.file;

  // Basic security check
  if (
    !fileToDelete ||
    fileToDelete.includes("..") ||
    fileToDelete.includes("/")
  ) {
    return res.status(400).send("Invalid file name.");
  }

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      if (!website) {
        return res.status(404).render("error/404.ejs");
      }

      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        fileToDelete
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("File deletion error:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        res.redirect(`/web/manage/${websiteUuid}`);
      });
    }
  );
});

module.exports = router;
