console.log("pages/user/database.js loaded"); // To confirm that the page has been loaded correctly

// ins't work now, but will be working in the future, when ? i don't know btw i know its for soon

const express = require("express");
const db = require("../../db.js");
const { isAuthenticated } = require("../../middleware/auth.js");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// GET: List user's databases
router.get("/web/database", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.all(
    `SELECT id, uuid, database_name, database_type, database_port,
            database_ipv4, database_username, database_password, disk_usage
     FROM databases WHERE user_id = ?`,
    [userId],
    (err, Databases) => {
      if (err) {
        console.error("Error retrieving database:", err.message);
        return res.status(500).send("Internal server error");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Error while retrieving the rank:", err.message);
          return res.status(500).send("Internal server error");
        }

        res.render("web/database.ejs", {
          user: req.session.user,
          Databases,
          rank: row ? row.rank : null,
        });
      });
    }
  );
});

// POST: Create a new database
router.post("/web/database/create", isAuthenticated, (req, res) => {
  const user = req.session.user;
  const { name, type, username, password, port, ipv4 } = req.body;

  if (!name || !type)
    return res.status(400).json({ error: "Missing required fields" });

  const newUuid = uuidv4();

  db.run(
    `INSERT INTO Databases (
      user_id, uuid, database_name, database_type,
      database_username, database_password,
      database_port, database_ipv4, disk_usage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      newUuid,
      name,
      type,
      username || null,
      password || null,
      port || null,
      ipv4 || null,
      0,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ success: true, id: this.lastID });
    }
  );
});

module.exports = router;
