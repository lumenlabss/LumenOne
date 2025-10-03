// console.log("pages/user/home.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const { isAuthenticated } = require("../../middleware/auth.js");
const router = express.Router();

// Route for the user's website list
router.get("/web/list", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.all(
    "SELECT name, port, disk_limit, uuid FROM websites WHERE user_id = ?",
    [userId],
    (err, websites) => {
      if (err) {
        console.error("Error retrieving websites:", err.message);
        return res.status(500).send("Internal server error");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Error while retrieving the rank: " + err.message);
          return res.status(500).send("Internal server error");
        }

        res.render("web/list.ejs", {
          user: req.session.user,
          websites,
          rank: row ? row.rank : null,
          NetworkIP: "Loading...", // placeholder
        });
      });
    }
  );
});

module.exports = router;
