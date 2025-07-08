const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const crypto = require("crypto");

// POST /api/admin/api-keys
router.post("/api/admin/api-keys", async (req, res) => {
  const {
    description,
    view_website = 0,
    delete_website = 0,
    create_website = 0,
    view_users = 0,
    modify_users = 0,
    delete_users = 0,
    create_users = 0,
  } = req.body;

  if (!description || description.trim() === "") {
    return res.status(400).json({ error: "Description required" });
  }

  // Generate a random API key
  const api_key = crypto.randomBytes(32).toString("hex");

  db.run(
    `INSERT INTO apikey (
      api_key,
      view_website,
      delete_website,
      create_website,
      view_users,
      modify_users,
      delete_users,
      create_users
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      api_key,
      view_website ? 1 : 0,
      delete_website ? 1 : 0,
      create_website ? 1 : 0,
      view_users ? 1 : 0,
      modify_users ? 1 : 0,
      delete_users ? 1 : 0,
      create_users ? 1 : 0,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      // Returns the generated API key + description (if you have a description column, otherwise ignore).
      res.json({ success: true, api_key });
    }
  );
});

module.exports = router;
