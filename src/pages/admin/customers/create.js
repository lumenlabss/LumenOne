const express = require("express");
const db = require("../../../db.js");
const router = express.Router();

// Middleware to check if the user is authenticated and has the admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    // Check the user's rank in the database
    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error while checking user rank: " + err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank; // Store the rank in the session
        return next(); // User is authenticated and has admin rank
      }

      // If the user is not admin, show a 403 error page
      return res.status(403).render("error/403.ejs", {
        message: "Access denied. Admins only.",
      });
    });
  } else {
    // Redirect to the login page if the user is not authenticated
    res.redirect("/");
  }
}

// Route for the admin create user page
router.get("/web/admin/customers/create", isAuthenticated, (req, res) => {
  db.all("SELECT id, username, rank FROM users", (err, rows) => {
    if (err) {
      console.error("Error fetching users: " + err.message);
      return res.status(500).send("Internal server error");
    }

    // Render the customers page with the list of users
    res.render("web/admin/customers/create.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,
      users: rows,
    });
  });
});

module.exports = router;
