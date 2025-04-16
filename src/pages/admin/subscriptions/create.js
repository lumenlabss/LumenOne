const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const http = require("http"); // Added the HTTP module
const router = express.Router();
const db = require("../../../db");

// Middleware to check if the user is authenticated and has admin rank
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Error retrieving rank:", err.message);
        return res.status(500).render("error/500.ejs", {
          message: "Internal server error",
        });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank;
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

// GET route to display the creation page
router.get("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) {
      console.error("Error loading users:", err.message);
      return res.status(500).send("Server error");
    }

    res.render("web/admin/subscriptions/create", {
      appName: "Echo-Host",
      users: rows,
      user: req.session?.user,
      rank: req.session?.user?.rank,
    });
  });
});

// POST route to create a website
router.post("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  const { userId, diskLimit, port } = req.body;

  if (!userId || !diskLimit || !port) {
    return res.status(400).send("Missing fields!");
  }

  const uuid = crypto.randomUUID();

  const sql = `
    INSERT INTO websites (user_id, uuid, name, port, disk_limit)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [userId, uuid, "Site", port, diskLimit], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error.");
    }

    const folderPath = path.join(
      __dirname,
      "../../../../storage/volumes",
      uuid
    );

    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating folder:", err.message);
        return res.status(500).send("Error creating folder.");
      }

      // Check if index.html exists
      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (exists) {
          // Create an HTTP server to listen on the specified port
          const server = http.createServer((req, res) => {
            fs.readFile(filePath, "utf8", (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.end("Error reading the file");
              } else {
                res.setHeader("Content-Type", "text/html");
                res.end(data);
              }
            });
          });

          // Start the server on the specified port
          server.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
          });

          console.log(
            `Site created: UUID=${uuid}, Port=${port}, Disk=${diskLimit}MB`
          ); // Debug
        } else {
          console.log(
            `index.html file missing for site UUID=${uuid}, Port=${port}. Server not started.`
          );
        }
      });

      return res.redirect("/web/admin/subscriptions");
    });
  });
});

// Function to restart all active servers on startup
function startAllActiveServers() {
  db.all("SELECT * FROM websites", (err, rows) => {
    if (err) {
      console.error("Error retrieving sites:", err.message);
      return;
    }

    rows.forEach((row) => {
      const folderPath = path.join(
        __dirname,
        "../../../../storage/volumes",
        row.uuid
      );
      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (exists) {
          // Create an HTTP server to listen on the specified port
          const server = http.createServer((req, res) => {
            fs.readFile(filePath, "utf8", (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.end("Error reading the file");
              } else {
                res.setHeader("Content-Type", "text/html");
                res.end(data);
              }
            });
          });

          // Start the server on the specified port
          server.listen(row.port, () => {
            console.log(
              `Server for UUID=${row.uuid} started on http://localhost:${row.port}`
            );
          });
        } else {
          console.log(
            `index.html file missing for site UUID=${row.uuid}, Port=${row.port}. Server not started.`
          );
        }
      });
    });
  });
}

// Restart all active servers on app startup
startAllActiveServers();

module.exports = router;
