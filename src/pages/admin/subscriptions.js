const express = require("express");
const router = express.Router();
const { createNginxContainer } = require("../../handlers/dockers.js");
const db = require("../../db.js");

// Route to render the subscriptions.ejs page
router.get("/web/admin/subscriptions", isAuthenticated, (req, res) => {
  db.get(
    "SELECT rank FROM users WHERE id = ?",
    [req.session.user.id],
    (err, row) => {
      if (err) {
        console.error("Error while retrieving the rank: " + err.message);
        return res.status(500).send("Internal server error");
      }

      res.render("web/admin/subscriptions.ejs", {
        user: req.session.user,
        rank: row ? row.rank : null,
      });
    }
  );
});

// Route to handle container creation
router.post("/admin/create-container", async (req, res) => {
  const { containerName, imageName, ports, userId } = req.body;

  // Parse ports (e.g., "80:8080,443:8443" -> { "80/tcp": "8080", "443/tcp": "8443" })
  const parsedPorts = ports.split(",").reduce((acc, portMapping) => {
    const [containerPort, hostPort] = portMapping.split(":");
    acc[`${containerPort}/tcp`] = hostPort;
    return acc;
  }, {});

  try {
    await createNginxContainer(containerName, userId, parsedPorts);
    res.send("Container created successfully!");
  } catch (error) {
    console.error("Error creating container:", error.message);
    res.status(500).send("Failed to create container.");
  }
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
