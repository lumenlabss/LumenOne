console.log("pages/admin/settings.js loaded");

const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

const configPath = path.join(__dirname, "../../config/config.json");

// GET - Display parameters page
router.get("/web/admin/settings", isAuthenticated, (req, res) => {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file: " + err.message);
      return res.status(500).send("Internal server error");
    }

    let config;
    try {
      config = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing config file: " + parseErr.message);
      return res.status(500).send("Internal server error");
    }

    db.all("SELECT id, username, rank FROM users", (err, rows) => {
      if (err) {
        console.error("Error fetching users: " + err.message);
        return res.status(500).send("Internal server error");
      }

      res.render("web/admin/settings.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
        users: rows,
        config: config,
      });
    });
  });
});

// POST - Update config
router.post("/web/admin/settings", isAuthenticated, (req, res) => {
  const updatedConfig = {
    hostname: req.body.hostname,
    port: parseInt(req.body.port),
    name: req.body.name,
    version: req.body.version,
    session: {
      secret: req.body.session_secret,
      resave: req.body.session_resave === "true",
      saveUninitialized: req.body.session_saveUninitialized === "true",
      cookie: {
        secure: req.body.session_cookie_secure === "true",
      },
    },
  };

  fs.writeFile(
    configPath,
    JSON.stringify(updatedConfig, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing config file: " + err.message);
        return res
          .status(500)
          .send("Erreur lors de la sauvegarde de la configuration.");
      }

      res.redirect("/web/admin/settings");
    }
  );
});

module.exports = router;
