const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const db = require("../db.js");
const { addDomain } = require("../web/domain.js");

exports.getSubscriptions = (req, res) => {
    const sql = `
    SELECT websites.*, users.username 
    FROM websites 
    JOIN users ON websites.user_id = users.id
  `;

    db.all(sql, (err, allWebsites) => {
        if (err) {
            console.error("Error retrieving websites:", err.message);
            return res.status(500).send("Server error");
        }

        res.render("web/admin/subscriptions.ejs", {
            totalListWebsite: allWebsites.length,
            websites: allWebsites,
            user: req.session?.user,
            rank: req.session?.user?.rank,
        });
    });
};

exports.deleteSubscription = (req, res) => {
    const websiteUuid = req.params.uuid;

    db.get(
        "SELECT * FROM websites WHERE uuid = ?",
        [websiteUuid],
        (err, website) => {
            if (err) {
                console.error("Error fetching website:", err.message);
                return res.status(500).render("error/500.ejs");
            }

            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            const filePath = path.join(
                __dirname,
                "../../storage/volumes",
                websiteUuid,
            );

            // Corrected path for Nginx config file
            const nginxConfigPath = path.join(
                "/etc",
                "nginx",
                "sites-enabled",
                website.name + ".conf",
            );

            // Delete from DB
            db.run(
                "DELETE FROM websites WHERE uuid = ?",
                [websiteUuid],
                (err) => {
                    if (err) {
                        console.error("Error deleting website:", err.message);
                        return res.status(500).render("error/500.ejs");
                    }

                    // Delete folder (optional)
                    fs.rm(filePath, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error("Error deleting files:", err.message);
                        }

                        // Delete Nginx config file
                        fs.rm(nginxConfigPath, (err) => {
                            if (err) {
                                console.error(
                                    "Error deleting Nginx config:",
                                    err.message,
                                );
                            } else {
                                console.log(
                                    `Deleted Nginx config for ${website.name}`,
                                );
                            }

                            // After deletion of config, restart Nginx
                            const { exec } = require("child_process");
                            exec(
                                "sudo systemctl restart nginx",
                                (err, stdout, stderr) => {
                                    if (err) {
                                        console.error(
                                            `Error restarting Nginx: ${stderr}`,
                                        );
                                    } else {
                                        console.log(
                                            "Nginx restarted successfully",
                                        );
                                    }
                                },
                            );

                            res.redirect("/web/admin/subscriptions");
                        });
                    });
                },
            );
        },
    );
};

exports.getCreateSubscription = (req, res) => {
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
};

exports.createSubscription = (req, res) => {
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

        const folderPath = path.join(__dirname, "../../storage/volumes", uuid);

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
                            console.error(
                                "Error creating index.html:",
                                err.message,
                            );
                            return res
                                .status(500)
                                .send("Error creating index.html.");
                        }
                        console.log(`Created default index.html for ${name}`);
                    });
                }

                // Creating the php.ini file
                const phpIniPath = path.join(folderPath, "php.ini");
                const phpIniContent = `
open_basedir = ${folderPath}
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
                        return res
                            .status(500)
                            .send("Failed to create php.ini.");
                    }

                    // Ajout du domaine nginx
                    addDomain(name, folderPath, (err) => {
                        if (err) {
                            console.error(
                                `Error adding domain for ${name}:`,
                                err,
                            );
                            return res
                                .status(500)
                                .send("Failed to add domain.");
                        }

                        console.log(
                            `New website : UUID=${uuid}, Domaine=${name}, Port=${port}, Disk=${diskLimit}MB`,
                        );
                        return res.redirect("/web/admin/subscriptions");
                    });
                });
            });
        });
    });
};
