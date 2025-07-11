const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../../lumenone.db");
const db = new sqlite3.Database(dbPath);

function checkApiKey(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  db.get("SELECT * FROM apikey WHERE api_key = ?", [apiKey], (err, row) => {
    if (err) {
      console.error("DB error in API key check:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    next();
  });
}

router.delete("/user/delete", checkApiKey, (req, res) => {
  const userId = req.body.id || req.query.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, deletedUserId: userId });
  });
});

module.exports = router;
