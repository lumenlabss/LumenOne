const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Route GET pour afficher la page de connexion
router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

// Route POST pour gérer la connexion
router.post("/login", (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .render("auth/login.ejs", { error: "Tous les champs sont requis." });
  }

  const username = req.body.username;
  const password = req.body.password;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error(
          "Erreur lors de la requête à la base de données : " + err.message
        );
        res.status(500).send("Erreur interne du serveur");
      } else if (row) {
        // Définir la session utilisateur
        req.session.user = { id: row.id, username: row.username };
        console.log("Utilisateur connecté :", req.session.user);
        res.redirect("/panel/web/list");
      } else {
        res.render("auth/login.ejs", { error: "Identifiants invalides" });
      }
    }
  );
});

module.exports = router;
