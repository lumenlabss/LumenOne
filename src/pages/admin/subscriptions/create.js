const express = require("express");
const db = require("../../../db.js");
const path = require("path");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const {
  configureSitePort,
  createSiteFolder,
} = require("../../../handler/website.js");

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error while checking user rank: " + err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Access denied. Admins only.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// Route to display the creation page
router.get("/web/admin/subscriptions/create", isAdmin, (req, res) => {
  db.all("SELECT id, username FROM users", (err, users) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res
        .status(500)
        .render("error/500", { message: "Database error." });
    }
    res.render("web/admin/subscriptions/create", {
      users,
      rank: req.session.user.rank,
    });
  });
});

// Route to handle site creation
router.post("/web/admin/subscriptions/create", isAdmin, (req, res) => {
  const { userId, diskLimit, port } = req.body;

  if (!userId || !diskLimit || !port) {
    return res
      .status(400)
      .render("error/400", { message: "All fields are required." });
  }

  const siteId = uuidv4(); // Generate a unique UUID for the site
  const sitePath = path.join(__dirname, "../../../../storage/volumes", siteId);

  // Check if the port is already in use
  db.get("SELECT * FROM containers WHERE ports = ?", [port], (err, row) => {
    if (err) {
      console.error("Error checking port:", err.message);
      return res
        .status(500)
        .render("error/500", { message: "Database error." });
    }
    if (row) {
      return res
        .status(400)
        .render("error/400", { message: "Port already in use." });
    }

    // Create the folder for the site
    createSiteFolder(sitePath);

    // Save the information in the database
    db.run(
      `INSERT INTO containers (user_id, container_name, image, ports) VALUES (?, ?, ?, ?)`,
      [userId, siteId, "custom-image", port],
      (err) => {
        if (err) {
          console.error("Error inserting into containers table:", err.message);
          return res
            .status(500)
            .render("error/500", { message: "Database error." });
        }

        // Configure the site to be accessible on the selected port
        configureSitePort(sitePath, port);

        res.redirect("/web/admin/subscriptions");
      }
    );
  });
});

module.exports = router;
