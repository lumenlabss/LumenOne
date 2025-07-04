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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: "Inter", sans-serif;
      }
      .glass-card {
        background: rgba(31, 41, 55, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
      }
      .glass-card:hover {
        transform: translateY(-4px);
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.3);
      }
      .gradient-bg {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      }
      .gradient-text {
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    </style>
  </head>
  <body class="gradient-bg text-white min-h-screen flex items-center justify-center p-4">
    
    <div class="glass-card max-w-lg w-full rounded-2xl p-8 text-center shadow-lg">
      <h1 class="text-3xl md:text-4xl font-bold gradient-text mb-4">Welcome to ${name}!</h1>
      <p class="text-gray-300 mb-6">This is the default page for your website ${name}.</p>
      
      <div class="mt-8 text-sm text-gray-400">
        <p>&copy; <span id="year"></span> LumenOne. All rights reserved.</p>
      </div>
    </div>

    <script>
      document.getElementById("year").textContent = new Date().getFullYear();
    </script>
  </body>
</html>`;

          fs.writeFile(filePath, defaultHtml, (err) => {
            if (err) {
              console.error("Error creating index.html:", err.message);
              return res.status(500).send("Error creating index.html.");
            }
            console.log(`Created default index.html for ${name}`);
          });
        }

        // Creating the php.ini file
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
