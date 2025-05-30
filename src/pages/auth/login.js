console.log("pages/auth/login.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const { authLimiter } = require("../../middleware/rate-limiter.js");
const router = express.Router();

// Route GET to display the login page
router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

// Route POST with limiter to handle login
router.post("/login", (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .render("auth/login.ejs", { error: "Tous les champs sont requis." });
  }

  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("Erreur SQL : " + err.message);
        res.status(500).send("Erreur serveur interne");
      } else if (row) {
        req.session.user = { id: row.id, username: row.username };
        console.log("Utilisateur connecté :", req.session.user);
        res.redirect("/web/list");
      } else {
        res.render("auth/login.ejs", { error: "Identifiants invalides." });
      }
    }
  );
});

module.exports = router;
