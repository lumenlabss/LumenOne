const express = require("express");
const db = require("../../db.js");

const router = express.Router();

// Route pour la page protégée
router.get("/panel/web/list", isAuthenticated, (req, res) => {
  db.get(
    "SELECT rank FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération du rang : " + err.message
        );
        return res.status(500).send("Erreur interne du serveur");
      }

      res.render("web/list.ejs", {
        user: req.session.user,
        rank: row ? row.rank : null,
      });
    }
  );
});

// middleware pour vérifier si l'utilisateur est authentifié
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
