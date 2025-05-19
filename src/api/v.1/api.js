console.log("api/v.1/api.js loaded"); // To confirm that the file has been loaded correctly

const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const crypto = require("crypto");

// Utils
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

function checkApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "API key required." });

  db.get("SELECT * FROM api_keys WHERE key = ?", [apiKey], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (!row) return res.status(403).json({ error: "Invalid API key." });
    next();
  });
}

// Generate a new API key
router.post("/api/application/generate-key", (req, res) => {
  const key = generateApiKey();
  db.run(
    "INSERT INTO api_keys (key, created_at) VALUES (?, datetime('now'))",
    [key],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error." });
      res.json({ success: true, key });
    }
  );
});

// Check if API key is valid
router.get("/api/application/validate-key", checkApiKey, (req, res) => {
  res.json({ success: true, message: "API key is valid." });
});

// 👤 Get all users (secured route)
router.get("/api/application/users", checkApiKey, (req, res) => {
  db.all("SELECT id, username, email FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json({ success: true, users: rows });
  });
});

module.exports = router;
