const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Middleware to check if the user is authenticated and has admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error retrieving rank:", err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank;
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Access denied. Admins only.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// GET route to show the user's websites
router.get("/web/admin/subscriptions", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  // Retrieve all websites of the logged-in user
  db.all(
    "SELECT * FROM websites WHERE user_id = ?",
    [userId],
    (err, userWebsites) => {
      if (err) {
        console.error("Error retrieving user websites:", err.message);
        return res.status(500).send("Server error");
      }

      // Calculate the total number of websites in the database (or filter as needed)
      db.all("SELECT * FROM websites", (err, totalWebsites) => {
        if (err) {
          console.error("Error retrieving total websites:", err.message);
          return res.status(500).send("Server error");
        }

        // Passing data to the view
        res.render("web/admin/subscriptions.ejs", {
          userWebsites, // The websites for the logged-in user
          totalListWebsite: totalWebsites.length, // Total websites in the system
          user: req.session?.user,
          rank: req.session?.user?.rank,
        });
      });
    }
  );
});

module.exports = router;
