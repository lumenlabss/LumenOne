const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Middleware authentification
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Route gestion page website
router.get("/web/manage/:id", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("Erreur DB:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      if (!website) {
        return res.status(404).render("error/404.ejs");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Erreur récupération rank:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        const filesPath = path.join(
          __dirname,
          "../../../storage/volumes",
          websiteUuid
        );

        fs.readdir(filesPath, (err, fileList) => {
          if (err) {
            console.error("Erreur lecture dossier:", err.message);
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

module.exports = router;
