console.log("api/official/v1.js loaded");

const express = require("express");
const router = express.Router();
const db = require("../../db.js");

// Middleware pour vérifier la clé API dans la DB
function checkApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "API key required." });

  db.get("SELECT * FROM apikey WHERE api_key = ?", [apiKey], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (!row) return res.status(403).json({ error: "Invalid API key." });

    // Accès aux permissions si besoin via row
    // ex: req.permissions = row;

    next();
  });
}

// Route pour valider la clé API
router.get("/api/v1/application/validate-key", checkApiKey, (req, res) => {
  res.json({ success: true, message: "API key is valid." });
});

// Route protégée pour lister les utilisateurs
router.get("/api/v1/application/users", checkApiKey, (req, res) => {
  db.all("SELECT id, username, email FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json({ success: true, users: rows });
  });
});

module.exports = router;
