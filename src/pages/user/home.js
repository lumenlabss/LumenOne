const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Route for the user's home page
router.get("/panel/web/list", isAuthenticated, (req, res) => {
  db.get(
    "SELECT rank FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err) {
        console.error("Error while retrieving the rank: " + err.message);
        return res.status(500).send("Internal server error");
      }

      res.render("web/list.ejs", {
        user: req.session.user,
        rank: row ? row.rank : null,
      });
    }
  );
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
