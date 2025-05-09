console.log("pages/admin/settings.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../middleware/auth-admin.js");

// Route for the admin customers page
router.get("/web/admin/settings", isAuthenticated, (req, res) => {
  db.all("SELECT id, username, rank FROM users", (err, rows) => {
    if (err) {
      console.error("Error fetching users: " + err.message);
      return res.status(500).send("Internal server error");
    }

    // Render the customers page with the list of users
    res.render("web/admin/settings.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,
      users: rows,
    });
  });
});

module.exports = router;
