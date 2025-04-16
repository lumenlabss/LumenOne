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

// GET route to show all websites (admin view)
router.get("/web/admin/subscriptions", isAuthenticated, (req, res) => {
  // Jointure pour récupérer les infos de l'utilisateur lié à chaque site
  const sql = `
    SELECT websites.*, users.username 
    FROM websites 
    JOIN users ON websites.user_id = users.id
  `;

  db.all(sql, (err, allWebsites) => {
    if (err) {
      console.error("Error retrieving websites:", err.message);
      return res.status(500).send("Server error");
    }

    res.render("web/admin/subscriptions.ejs", {
      totalListWebsite: allWebsites.length,
      websites: allWebsites,
      user: req.session?.user,
      rank: req.session?.user?.rank,
    });
  });
});

module.exports = router;
