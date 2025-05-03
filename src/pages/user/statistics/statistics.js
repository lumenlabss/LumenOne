console.log("pages/user/statistics/statistics.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session?.user) return next();
  res.redirect("/");
}

// Website statistics page route
router.get("/web/statistics/:id", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const websiteUuid = req.params.id;
  const statisticsFile = path.join(
    __dirname,
    "../../../../storage/statistics.json"
  );

  db.get(
    "SELECT * FROM websites WHERE uuid = ? AND user_id = ?",
    [websiteUuid, userId],
    (err, website) => {
      if (err) {
        console.error("DB error:", err.message);
        return res.status(500).render("error/500.ejs");
      }
      if (!website) {
        return res.status(404).render("error/404.ejs");
      }

      db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          console.error("Error retrieving rank:", err.message);
          return res.status(500).render("error/500.ejs");
        }

        let visitCount = 0;

        // Read the statistics file
        if (fs.existsSync(statisticsFile)) {
          try {
            const data = fs.readFileSync(statisticsFile, "utf8");
            const stats = JSON.parse(data);
            visitCount = stats[websiteUuid] || 0;
          } catch (e) {
            console.error("Error reading/parsing statistics.json:", e);
          }
        }

        res.render("web/statistics/statistics.ejs", {
          user: req.session.user,
          website,
          rank: row ? row.rank : null,
          websiteUuid,
          visitCount,
        });
      });
    }
  );
});

module.exports = router;
