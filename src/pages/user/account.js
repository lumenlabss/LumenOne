// console.log("pages/user/account.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const useragent = require("useragent");
const db = require("../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../middleware/auth.js");

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

      db.all(
        "SELECT id, user_id, activity, browser, ip, os, activity_at FROM users_activity WHERE user_id = ? ORDER BY activity_at DESC",
        [userId],
        (err2, activity) => {
          if (err2) {
            console.error("Error retrieving user activities:", err2.message);
            return res.status(500).send("Internal server error");
          }

          res.render("web/account.ejs", {
            user: fullUser,
            rank: userInfo.rank,
            error: null,
            succes: null,
            activity: activity || [],
          });
        }
      );
    }
  );
});

// Route for change username
router.post("/web/account/username/save", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const newUsername = req.body.username;

  if (!newUsername) {
    return res.render("web/account", {
      error: "Username cannot be empty",
      succes: false,
      rank: req.session.user.rank,
      user: req.session.user,
      activity: [],
    });
  }

  db.run(
    "UPDATE users SET username = ? WHERE id = ?",
    [newUsername, userId],
    function (err) {
      if (err) {
        console.error("Error updating username:", err.message);
        return res.render("web/account", {
          error: "Server Error",
          succes: false,
          rank: req.session.user.rank,
          user: req.session.user,
          activity: [],
        });
      }

      // Session update
      req.session.user.username = newUsername;

      // Addition to users_activity
      const agent = useragent.parse(req.headers["user-agent"]);
      const browser = agent.family || "Unknown";

      let os = "Unknown";
      if (agent.os) {
        const { family, major, minor, patch } = agent.os;
        os = family || "Unknown";
        if (major) os += ` ${major}`;
        if (minor) os += `.${minor}`;
        if (patch) os += `.${patch}`;
      }

      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const activity_at = `${now.getFullYear()}-${pad(
        now.getMonth() + 1
      )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
        now.getMinutes()
      )}:${pad(now.getSeconds())}`;

      db.run(
        `INSERT INTO users_activity (user_id, activity, browser, ip, os, activity_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          "Username Changed",
          browser,
          req.ip || req.connection.remoteAddress || "Unknown",
          os,
          activity_at,
        ],
        function (err) {
          if (err) console.error("Error logging activity:", err.message);

          // Recovery of recent activities
          db.all(
            "SELECT id, user_id, activity, browser, ip, os, activity_at FROM users_activity WHERE user_id = ? ORDER BY activity_at DESC",
            [userId],
            (err2, activity) => {
              if (err2) {
                console.error(
                  "Error retrieving user activities:",
                  err2.message
                );
                return res.status(500).send("Internal server error");
              }

              // Success response
              res.render("web/account", {
                succes: "Username updated successfully",
                error: null,
                rank: req.session.user.rank,
                user: req.session.user,
                activity: activity || [],
              });
            }
          );
        }
      );
    }
  );
});

// Route for change password
router.post("/web/account/password/save", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { current_password, new_password, confirm_new_password } = req.body;

  if (!current_password || !new_password || !confirm_new_password) {
    return res.render("web/account", {
      error: "All fields are required",
      succes: null,
      user: req.session.user,
      rank: req.session.user.rank, // Pass rank to the view
    });
  }

  if (new_password !== confirm_new_password) {
    return res.render("web/account", {
      error: "New passwords do not match",
      succes: null,
      user: req.session.user,
      rank: req.session.user.rank, // Pass rank to the view
    });
  }

  db.get("SELECT password FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
      console.error("Error fetching user password:", err.message);
      return res.render("web/account", {
        error: "Server Error",
        succes: null,
        user: req.session.user,
        rank: req.session.user.rank, // Pass rank to the view
      });
    }

    if (!row) {
      return res.render("web/account", {
        error: "User not found",
        succes: null,
        user: req.session.user,
        rank: req.session.user.rank, // Pass rank to the view
      });
    }

    if (row.password !== current_password) {
      return res.render("web/account", {
        error: "Current password is incorrect",
        user: req.session.user,
        succes: null,
        rank: req.session.user.rank, // Pass rank to the view
      });
    }

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [new_password, userId],
      function (err) {
        if (err) {
          console.error("Error updating password:", err.message);
          return res.render("web/account", {
            error: "Server Error",
            succes: null,
            user: req.session.user,
            rank: req.session.user.rank, // Pass rank to the view
          });
        }

        res.render("web/account", {
          succes: "Password updated successfully",
          error: null,
          user: req.session.user,
          rank: req.session.user.rank, // Pass rank to the view
        });
      }
    );
  });
});

module.exports = router;
