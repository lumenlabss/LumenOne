// console.log("pages/auth/login.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const { authLimiter } = require("../../middleware/rate-limiter.js");
const router = express.Router();

// Route GET to display the login page
router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

// Route POST with limiter to handle login
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
        console.error("ERROR SQL : " + err.message);
        res.status(500).send("Internal server error");
      } else if (row) {
        req.session.user = { id: row.id, username: row.username };
        console.log("User logged in :", req.session.user);
        res.redirect("/web/list");
      } else {
        res.render("auth/login.ejs", { error: "Identifiants invalides." });
      }
    }
  );
});

module.exports = router;
