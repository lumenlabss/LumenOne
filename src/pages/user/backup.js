const express = require("express");
const path = require("path");
const db = require("../../db.js");
const { isAuthenticated } = require("../../middleware/auth.js");

const router = express.Router();

router.get("web/backup", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  db.all(
    "SELECT id, name, created_at FROM backups WHERE user_id = ?",
    [userId],
    (err, backups) => {
      if (err) {
        console.error("Error retrieving backups:", err.message);
        return res.status(500).send("Internal server error");
      }

      res.render("web/backup.ejs", {
        user: req.session.user,
        backups,
      });
    }
  );
});

module.exports = router;
