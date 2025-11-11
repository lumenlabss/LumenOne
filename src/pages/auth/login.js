const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db.js");
const { authLimiter } = require("../../middleware/rate-limiter.js");
const { loginActivity } = require("../../middleware/activity/loginActivity.js");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

router.post("/login", authLimiter, (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .render("auth/login.ejs", { error: "All fields are required." });
  }

  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(500).send("Internal server error");
    }

    if (!row) {
      return res.render("auth/login.ejs", { error: "Invalid credentials." });
    }

    try {
      const isMatch = await bcrypt.compare(password, row.password);

      if (isMatch) {
        // Login success
        req.session.user = { id: row.id, username: row.username };

        loginActivity(row.id, "Successful Login", req)(res, () => {
          res.redirect("/web/list");
        });
      } else {
        // Login fail
        loginActivity(row.id, "Failed Login", req)(res, () => {
          res.render("auth/login.ejs", { error: "Invalid credentials." });
        });
      }
    } catch (e) {
      console.error("bcrypt compare error:", e);
      res.status(500).send("Internal server error");
    }
  });
});

module.exports = router;
