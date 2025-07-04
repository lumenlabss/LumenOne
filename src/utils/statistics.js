// idk if its working lol.
console.log("utils/statistics.js loaded"); // To confirm that the page has been loaded correctly
const sqlite = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const db = require("../../db.js");

/**
 * Increment stats for a given site
 * @param {string} siteName - Site name
 */
function recordVisit(siteName) {
  // checks whether the site exists in the websites table
  db.get(
    `SELECT * FROM websites WHERE name = ?`,
    [siteName],
    (err, siteRow) => {
      if (err) return console.error(err);
      if (!siteRow) {
        console.warn(`Site "${siteName}" not found in table websites.`);
        return;
      }

      // If the site exists, check if it already has stats
      db.get(
        `SELECT * FROM statistic WHERE site = ?`,
        [siteName],
        (err, statRow) => {
          if (err) return console.error(err);

          if (statRow) {
            // The stats exist, we increment
            db.run(
              `UPDATE statistic
               SET visitors_day = visitors_day + 1,
                   visitors_week = visitors_week + 1,
                   visitors_month = visitors_month + 1,
                   visitors_total = visitors_total + 1
               WHERE site = ?`,
              [siteName],
              (err) => {
                if (err) console.error(err);
              }
            );
          } else {
            // No stats yet, just initialize
            db.run(
              `INSERT INTO statistic (site, visitors_day, visitors_week, visitors_month, visitors_total)
               VALUES (?, 1, 1, 1, 1)`,
              [siteName],
              (err) => {
                if (err) console.error(err);
              }
            );
          }
        }
      );
    }
  );
}

module.exports = {
  recordVisit,
};
