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

module.exports = router;
