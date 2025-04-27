const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const router = express.Router();
const db = require("../../../db");
const addDomain = require("../../../web/domain");

let activeServers = {};

// Middleware to check if the user is authenticated and has admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Erreur de récupération du rang :", err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank;
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Access forbidden. Admins only.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// // Route GET to display the creation page
router.get("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) {
      console.error("Error loading users :", err.message);
      return res.status(500).send("Server error");
    }

    res.render("web/admin/subscriptions/create", {
      users: rows,
      user: req.session?.user,
      rank: req.session?.user?.rank,
    });
  });
});

// POST route to create a site
router.post("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  const { userId, diskLimit, port, name } = req.body; // Use of 'name' for the domain

  // Check that all required fields are present
  if (!userId || !diskLimit || !port || !name) {
    return res.status(400).send("Missing fields !");
  }

  const uuid = crypto.randomUUID();

  const sql = `
    INSERT INTO websites (user_id, uuid, name, port, disk_limit)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [userId, uuid, name, port, diskLimit], function (err) {
    if (err) {
      console.error("Database error :", err.message);
      return res.status(500).send("Database error.");
    }

    const folderPath = path.join(
      __dirname,
      "../../../../storage/volumes",
      uuid
    );

    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Folder creation error :", err.message);
        return res.status(500).send("Folder creation error.");
      }

      // Check if the index.html file exists
      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (exists) {
          // Create an HTTP server to listen on the specified port
          const server = http.createServer((req, res) => {
            fs.readFile(filePath, "utf8", (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.end("File read error");
              } else {
                res.setHeader("Content-Type", "text/html");
                res.end(data);
              }
            });
          });

          activeServers[uuid] = server;
          // Start the server on the specified port
          server.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
          });

          // Add domain to Nginx configuration
          addDomain(name, port, (err) => {
            // 'name' used as domain
            if (err) {
              console.error(`Error adding domain for ${name} :`, err);
              return res.status(500).send("Failed to add domain.");
            }

            console.log(
              r`New website : UUID=${uuid}, Domaine=${name}, Port=${port}, Disk=${diskLimit}MB`
            ); // Debug
            return res.redirect("/web/admin/subscriptions");
          });
        } else {
          console.log(
            `Missing index.html file for the site UUID=${uuid}, Domaine=${name}, Port=${port}. Server not started.`
          );
        }
      });
    });
  });
});

module.exports = router;
module.exports.activeServers = activeServers;
