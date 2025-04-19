const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../../../db.js");
const router = express.Router();

// Middleware authentification
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Route pour afficher l'éditeur de fichiers
router.get("/web/manage/:id/edit/:file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const fileName = req.params.file;

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

      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        fileName
      );

      // Vérifier si le fichier existe
      fs.readFile(filePath, "utf8", (err, fileContent) => {
        if (err) {
          console.error("Erreur lecture fichier:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        // Afficher le contenu du fichier dans l'éditeur
        res.render("web/edit/files.ejs", {
          user: req.session.user,
          websiteUuid,
          fileName,
          fileContent,
        });
      });
    }
  );
});

// Route pour enregistrer les modifications du fichier
router.post("/web/manage/:id/edit/:file", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const fileName = req.params.file;
  const fileContent = req.body.content;

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

      const filePath = path.join(
        __dirname,
        "../../../storage/volumes",
        websiteUuid,
        fileName
      );

      // Sauvegarde des modifications dans le fichier
      fs.writeFile(filePath, fileContent, "utf8", (err) => {
        if (err) {
          console.error("Erreur écriture fichier:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        // Rediriger vers la page de gestion
        res.redirect(`/web/manage/${websiteUuid}`);
      });
    }
  );
});

module.exports = router;
