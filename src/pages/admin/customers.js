const express = require("express");
const router = express.Router();
const db = require("../../db.js");

// Route to render the customer.ejs page
router.get("/web/admin/customers", isAuthenticated, (req, res) => {
  db.get(
    "SELECT rank FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err) {
        console.error("Error while retrieving the rank: " + err.message);
        return res.status(500).send("Internal server error");
      }

      // Check if the user has the admin role
      if (!row || row.rank !== "admin") {
        return res.status(403).render("error/403.ejs");
      }

      res.render("web/admin/customers.ejs", {
        user: req.session.user,
        rank: row.rank,
      });
    }
  );
});

// Middleware to check if the user is authenticated and has the admin role
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.rank === "admin") {
      return next();
    }
    return res.status(403).render("error/403.ejs");
  }
  res.redirect("/");
}

// Middleware to check if the user is authenticated and has the admin role
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.rank === "admin") {
      return next();
    }
    return res.status(403).render("error/403.ejs");
  }
  res.redirect("/");
}
module.exports = router;
