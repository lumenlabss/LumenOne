const express = require("express");
const path = require("path");
const fs = require("fs");
const db = require("../../db.js");
const { isAuthenticated } = require("../../middleware/auth.js");

const router = express.Router();

// Function to calculate “time ago”
function timeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date); // in ms
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);

  if (sec < 60) return `${sec} sec`;
  if (min < 60) return `${min} min`;
  if (h < 24) return `${h} h`;
  return `${d} j`;
}

// Function to convert size to B/KB/MB/GB
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1024 * 1024 * 1024)
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  else return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

router.get("/web/backup", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  // Retrieves all user backups
  db.all(
    "SELECT id, name, size, created_at FROM backups WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, backups) => {
      if (err) {
        console.error("Error retrieving backups:", err.message);
        return res.status(500).send("Internal server error");
      }

      // Also retrieves the list of the user's sites
      db.all(
        "SELECT id, name FROM websites WHERE user_id = ?",
        [userId],
        (err, websites) => {
          if (err) {
            console.error("Error retrieving websites:", err.message);
            return res.status(500).send("Internal server error");
          }

          // Retrieves the user's rank
          db.get(
            "SELECT rank FROM users WHERE id = ?",
            [userId],
            (err, row) => {
              if (err) {
                console.error(
                  "Error while retrieving the rank: " + err.message
                );
                return res.status(500).send("Internal server error");
              }

              // Calcul "time ago"
              let lastBackupTime =
                backups.length > 0 ? timeAgo(backups[0].created_at) : null;

              // Total size
              let totalSize = 0;
              backups.forEach((b) => (totalSize += b.size));
              const totalSizeFormatted = formatBytes(totalSize);

              res.render("web/backup.ejs", {
                user: req.session.user,
                backups,
                websites,
                rank: row ? row.rank : null,
                lastBackupTime,
                totalSizeFormatted,
                formatBytes,
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
