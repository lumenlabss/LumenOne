console.log("register.js is being used");
const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Route GET pour afficher la page register
router.get("/register", (req, res) => {
  res.render("auth/register.ejs", { error: null }); // ajuste si ton fichier ejs est ailleurs
});

// Route POST pour traiter le formulaire d'enregistrement
router.post("/register", (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).render("auth/register.ejs", {
      error: "Tous les champs sont obligatoires.",
    });
  }

  // Vérifier si l'utilisateur existe déjà
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("Erreur lors de la vérification de l'utilisateur :", err.message);
      return res.status(500).send("Erreur serveur.");
    }

    if (row) {
      // L'utilisateur existe déjà
      return res.render("auth/register.ejs", {
        error: "Ce nom d'utilisateur est déjà pris.",
      });
    }

    // Insérer le nouvel utilisateur dans la base de données
    db.run(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [0,username, password],
      function (err) {
        if (err) {
          console.error("Erreur lors de l'enregistrement :", err.message);
          return res.status(500).send("Erreur serveur.");
        }

        // Création de la session utilisateur
        req.session.user = { id: this.lastID, username: username };
        console.log("Nouvel utilisateur enregistré :", req.session.user);
        res.redirect("/web/list");
      }
    );
  });
});

module.exports = router;
