console.log("pages/user/database.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const { isAuthenticated } = require("../../middleware/auth.js");
const router = express.Router();

// Route for the user's database list
router.get("/web/database", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.all(
    "SELECT id, uuid, database_name, database_type, database_port, database_ipv4, database_username, database_password, disk_usage FROM databases WHERE user_id = ?",
    [userId],
    (err, Databases) => {
      if (err) {
        console.error("Error retrieving database:", err.message);
        return res.status(500).send("Internal server error");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Error while retrieving the rank: " + err.message);
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

module.exports = router;
