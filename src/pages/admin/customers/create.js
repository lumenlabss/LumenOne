console.log("pages/admin/customers/create.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../../middleware/auth-admin.js");

// Route GET : afficher le formulaire d'inscription
router.get("/web/admin/customers/create", isAuthenticated, (req, res) => {
  res.render("web/admin/customers/create.ejs", {
    user: req.session.user,
    rank: req.session.user.rank,
  });
});

// Route POST : enregistrer un nouvel utilisateur dans la base de données
router.post("/web/admin/customers/create", isAuthenticated, (req, res) => {
  const { username, password, rank } = req.body;

  if (!username || !password || !rank) {
    return res.status(400).send("Tous les champs sont requis.");
  }

  const sql = `INSERT INTO users (username, password, rank) VALUES (?, ?, ?)`;

  db.run(sql, [username, password, rank], function (err) {
    if (err) {
      console.error(
        "Erreur lors de l'enregistrement de l'utilisateur :",
        err.message
      );
      return res
        .status(500)
        .send("Erreur serveur lors de la création de l'utilisateur.");
    }

    console.log("Nouvel utilisateur enregistré avec l'ID :", this.lastID);
    res.redirect("/web/admin/customers/create");
  });
});

module.exports = router;
