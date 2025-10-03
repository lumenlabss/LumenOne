const express = require("express");
const db = require("../../db.js");
const { authLimiter } = require("../../middleware/rate-limiter.js");
const { loginActivity } = require("../../middleware/activity/loginActivity.js");
const router = express.Router();

// Route GET login page
router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

// Route POST login
router.post("/login", authLimiter, (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .render("auth/login.ejs", { error: "All fields are required." });
  }

  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("SQL Error:", err.message);
        return res.status(500).send("Internal server error");
      }

      if (row) {
        // Login sucess
        req.session.user = { id: row.id, username: row.username };

        loginActivity(
          row.id,
          "Successful Login",
          req
        )(res, () => {
          res.redirect("/web/list");
        });
      } else {
        // Login FAIL
        db.get(
          "SELECT id FROM users WHERE username = ?",
          [username],
          (err2, userRow) => {
            const targetId = userRow ? userRow.id : null;

            loginActivity(
              targetId,
              "Failed Login",
              req
            )(res, () => {
              res.render("auth/login.ejs", {
                error: "Invalid credentials.",
              });
            });
          }
        );
      }
    }
  );
});

module.exports = router;
