// console.log("pages/admin/customers/create.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const db = require("../../../db.js");
const router = express.Router();
const { isAuthenticated } = require("../../../middleware/auth-admin.js");
const bcrypt = require('bcrypt');

// Route GET : display registration form
router.get("/web/admin/customers/create", isAuthenticated, (req, res) => {
  res.render("web/admin/customers/create.ejs", {
    user: req.session.user,
    rank: req.session.user.rank,
  });
});

// Route POST : register a new user in the database
router.post("/web/admin/customers/create", isAuthenticated, async (req, res) => {
  const { username, password, rank } = req.body;

  if (!username || !password || !rank) {
    return res.status(400).send("All fields are required.");
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const sql = `INSERT INTO users (username, password, rank) VALUES (?, ?, ?)`;

  db.run(sql, [username, hashedPassword, rank], function (err) {
    if (err) {
      console.error("User registration error :", err.message);
      return res.status(500).send("Server error during user creation.");
    }

    console.log("New user registered with ID :", this.lastID);
    res.redirect("/web/admin/customers/create");
  });
});

module.exports = router;
