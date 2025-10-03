// console.log("src/api/official/v1.js loaded");
const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Chemin vers la DB lumenone.db
const dbPath = path.resolve(__dirname, "../../../lumenone.db");
const db = new sqlite3.Database(dbPath);

// Middleware pour vérifier la clé API dans header x-api-key
function checkApiKey(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  db.get("SELECT * FROM apikey WHERE api_key = ?", [apiKey], (err, row) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    next();
  });
}

// Route for testing the API key
router.get("/test", checkApiKey, (req, res) => {
  console.log("Route /api/v1/test called with valid API key !");
  res.json({ success: true, message: "Valid API key, route works." });
});

// == API Routes ===

// === User API ===

// Create a new user
router.post("/users", checkApiKey, (req, res) => {
  const { username, password, rank } = req.body;

  // check if all required fields are provided
  if (!username || !password || !rank) {
    return res
      .status(400)
      .json({ error: "Username, password and rank are required" });
  }

  // check if rank is valid
  if (rank !== "admin" && rank !== "default") {
    return res
      .status(400)
      .json({ error: "Invalid rank. Must be 'admin' or 'default'." });
  }

  // Insert the new user into the database
  db.run(
    `INSERT INTO users (username, password, rank) VALUES (?, ?, ?)`,
    [username, password, rank],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // here this.lastID = inserted id
      res.json({ success: true, message: "User created", userId: this.lastID });
    }
  );
});
//
//
// Get all users information
router.get("/users", checkApiKey, (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "internal server error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }
    res.json({ success: true, users: rows });
  });
});
//
//
// Get a user by username
router.get("/users/:username", checkApiKey, (req, res) => {
  const username = req.params.username;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, user: row });
  });
});
//
//
// Update a user by username
router.put("/users/:username", checkApiKey, (req, res) => {
  const username = req.params.username;
  const { password, rank } = req.body;
  // check if at least one field is provided
  if (!password && !rank) {
    return res.status(400).json({
      error: "At least one field (password or rank) is require to update",
    });
  }
  // check if rank is valid if provided
  if (rank && rank !== "admin" && rank !== "default") {
    return res
      .status(400)
      .json({ error: "Invalid rank. Must be admin or default." });
  }
  // Update the user in the database
  db.run(
    `UPDATE users SET password = ?, rank = ? WHERE username = ?`,
    [password, rank, username],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, message: "User updated" });
    }
  );
});
//
//
// Delete a user by username
router.delete("/users/:username", checkApiKey, (req, res) => {
  const username = req.params.username;

  db.run("DELETE FROM users WHERE username = ?", [username], function (err) {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  });
});

// === Website API ===

// Get all websites
router.get("/websites", checkApiKey, (req, res) => {
  db.all("SELECT * FROM websites", [], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "No websites found" });
    }

    res.json({ success: true, websites: rows });
  });
});
//
//
// Get a website by user owner
router.get("/websites/:userId", checkApiKey, (req, res) => {
  const userId = req.params.userId;

  db.all("SELECT * FROM websites WHERE user_id = ?", [userId], (err, row) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (row.length === 0) {
      return res.status(404).json({ error: "No websites found for this user" });
    }
    res.json({ success: true, websites: row });
  });
});
//
//
// Create a new website
router.post("/websites", checkApiKey, (req, res) => {
  const { userId, name, url } = req.body;

  if (!userId || !name || !url) {
    return res
      .status(400)
      .json({ error: "User ID, name and URL are required" });
  }
  db.run(
    `INSERT INTO websites (user_id, name, url) VALUES (?, ?, ?)`,
    [userId, name, url],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({
        success: true,
        message: "Website created",
        websiteID: this.lastID,
      });
    }
  );
});
//
//
// Delete a website by ID
router.delete("/websites/:id", checkApiKey, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM websites WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Website not found" });
    }

    res.json({ success: true, message: "Website deleted" });
  });
});

module.exports = router;
