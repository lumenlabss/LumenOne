console.log("login.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../db.js");
const router = express.Router();

// Route GET to display the login page
router.get("/", (req, res) => {
  res.render("auth/login.ejs", { error: null });
});

// Route POST to handle login
router.post("/login", (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .render("auth/login.ejs", { error: "All fields are required." });
  }

  const username = req.body.username;
  const password = req.body.password;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        console.error("Error during the database query: " + err.message);
        res.status(500).send("Internal server error");
      } else if (row) {
        // Set the user session
        req.session.user = { id: row.id, username: row.username };
        console.log("User logged in:", req.session.user); // Debug
        res.redirect("/web/list");
      } else {
        res.render("auth/login.ejs", { error: "Invalid credentials" });
      }
    }
  );
});

module.exports = router;
