console.log("pages/admin/subscriptions/create.js loaded"); // To confirm that the page has been loaded correctly
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const router = express.Router();
const db = require("../../../db");
const { addDomain } = require("../../../web/domain");
const { isAuthenticated } = require("../../../middleware/auth-admin.js");

let activeServers = {};

// Route GET to display the creation page
router.get("/web/admin/subscriptions/create", isAuthenticated, (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) {
      console.error("Error loading users:", err.message);
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
  const { userId, diskLimit, port, name } = req.body;

  if (!userId || !diskLimit || !port || !name) {
    return res.status(400).send("Missing fields!");
  }

  const uuid = crypto.randomUUID();

  const sql = `
    INSERT INTO websites (user_id, uuid, name, port, disk_limit)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [userId, uuid, name, port, diskLimit], function (err) {
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
        console.error("Folder creation error:", err.message);
        return res.status(500).send("Folder creation error.");
      }

      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (!exists) {
          const defaultHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to ${name}</title>
            </head>
            <body>
              <h1>Welcome to ${name}!</h1>
              <p>This is the default page for your website.</p>
            </body>
            </html>
          `;

          fs.writeFile(filePath, defaultHtml, (err) => {
            if (err) {
              console.error("Error creating index.html:", err.message);
              return res.status(500).send("Error creating index.html.");
            }
            console.log(`Created default index.html for ${name}`);
          });
        }

        // Création du fichier php.ini
        const phpIniPath = path.join(folderPath, "php.ini");
        const phpIniContent = `
disable_functions = exec,passthru,shell_exec,system,proc_open,popen
display_errors = Off
expose_php = Off
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
`.trim();

        fs.writeFile(phpIniPath, phpIniContent, (err) => {
          if (err) {
            console.error("Error writing php.ini:", err.message);
            return res.status(500).send("Failed to create php.ini.");
          }

          // Ajout du domaine nginx
          addDomain(name, folderPath, (err) => {
            if (err) {
              console.error(`Error adding domain for ${name}:`, err);
              return res.status(500).send("Failed to add domain.");
            }

            console.log(
              `New website : UUID=${uuid}, Domaine=${name}, Port=${port}, Disk=${diskLimit}MB`
            );
            return res.redirect("/web/admin/subscriptions");
          });
        });
      });
    });
  });
});

module.exports = router;
module.exports.activeServers = activeServers;
