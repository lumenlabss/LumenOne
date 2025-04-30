console.log("account.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/");
}

// Route for the user's account info
router.get("/web/account", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.get(
    "SELECT username, rank, created_at FROM users WHERE id = ?",
    [userId],
    (err, userInfo) => {
      if (err) {
        console.error("Error retrieving user info:", err.message);
        return res.status(500).send("Internal server error");
      }

      if (!userInfo) {
        return res.status(404).send("User not found");
      }

      const fullUser = {
        ...userInfo,
        id: userId,
      };

      res.render("web/account.ejs", {
        user: fullUser,
        rank: userInfo.rank,
      });
    }
  );
});

module.exports = router;
