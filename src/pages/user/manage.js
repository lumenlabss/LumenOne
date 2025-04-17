const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Middleware authentification
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Route gestion page website
router.get("/web/manage/:id", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("Erreur DB:", err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }
      if (!website) {
        return res.status(404).require("error/404.ejs", {
          message: "Not found",
        });
      }

      res.render("web/manage.ejs", {
        user: req.session.user,
        website,
        rank: req.session.user.rank,
        websiteUuid,
      });
    }
  );
});

module.exports = router;
