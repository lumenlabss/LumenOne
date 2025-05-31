console.log("pages/admin/settings.js loaded");

const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

const configPath = path.join(__dirname, "../../../config/config.json");

// GET - Display settings page
router.get("/web/admin/settings", isAuthenticated, (req, res) => {
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file: " + err.message);
      return res.status(500).render("error/500.ejs");
    }

    let config;
    try {
      config = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing config file: " + parseErr.message);
      return res.status(500).render("error/500.ejs");
    }

    db.all("SELECT id, username, rank FROM users", (err, rows) => {
      if (err) {
        console.error("Error fetching users: " + err.message);
        return res.status(500).render("error/500.ejs");
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
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file: " + err.message);
      return res.status(500).render("error/500.ejs");
    }

    let config;
    try {
      config = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing config file: " + parseErr.message);
      return res.status(500).render("error/500.ejs");
    }

    // Update fields, retaining those that have not been modified
    config.hostname = req.body.hostname || config.hostname;

    const port = parseInt(req.body.port);
    config.port = isNaN(port) ? config.port : port;

    config.name = req.body.name || config.name;
    config.version = req.body.version || config.version;

    // Session
    config.session.secret = req.body.session_secret || config.session.secret;
    config.session.resave = req.body.session_resave === "true";
    config.session.saveUninitialized =
      req.body.session_saveUninitialized === "true";
    config.session.cookie.secure = req.body.session_cookie_secure === "true";

    fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8", (err) => {
      if (err) {
        console.error("Error writing config file: " + err.message);
        return res.status(500).send("Error saving configuration.");
      }

      res.redirect("/web/admin/settings");
    });
  });
});

module.exports = router;
