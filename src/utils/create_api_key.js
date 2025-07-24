const express = require("express");
const router = express.Router();
const db = require("../db.js");
const crypto = require("crypto");

// POST /api/admin/api-keys
router.post("/admin/api-keys", async (req, res) => {
  // Generates a key with the prefix "lumo_"
  const api_key = "lumo_" + crypto.randomBytes(24).toString("hex");

  db.run(`INSERT INTO apikey (api_key) VALUES (?)`, [api_key], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "DB error: key may already exist?" });
    }

    res.json({ success: true, api_key });
  });
});

router.delete("/admin/api-keys/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid API key ID" });
  }

  db.run(`DELETE FROM apikey WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("DB delete error:", err);
      return res.status(500).json({ error: "DB error: " + err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "API key not found" });
    }

    res.json({ success: true, message: "API key deleted successfully" });
  });
});

module.exports = router;
