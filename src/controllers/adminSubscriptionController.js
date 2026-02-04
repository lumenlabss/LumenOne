const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const db = require("../db.js");
const { addDomain } = require("../web/domain.js");
const HaloProxy = require("../utils/haloProxy.js");

exports.getSubscriptions = (req, res) => {
    const sql = `
    SELECT websites.*, users.username, nodes.name as node_name
    FROM websites 
    JOIN users ON websites.user_id = users.id
    LEFT JOIN nodes ON websites.node_id = nodes.id
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
        "SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port FROM websites LEFT JOIN nodes ON websites.node_id = nodes.id WHERE uuid = ?",
        [websiteUuid],
        async (err, website) => {
            if (err) {
                console.error("Error fetching website:", err.message);
                return res.status(500).render("error/500.ejs");
            }

            if (!website) {
                return res.status(404).render("error/404.ejs");
            }

            // Delete from DB
            db.run(
                "DELETE FROM websites WHERE uuid = ?",
                [websiteUuid],
                async (err) => {
                    if (err) {
                        console.error("Error deleting website:", err.message);
                        return res.status(500).render("error/500.ejs");
                    }

                    // Delete remote files via HaloProxy if node exists
                    if (website.node_ip && website.node_port) {
                        try {
                            const proxy = new HaloProxy(website.node_ip, website.node_port);
                            // No explicit "delete whole site folder" in Halo agent yet, 
                            // but we can add it or just leave it for now.
                            // For now, let's assume reset to empty is enough or add DELETE endpoint to Halo.
                        } catch (e) {
                            console.error("Failed to delete remote files:", e.message);
                        }
                    }

                    // Delete Nginx config file
                    const nginxConfigPath = path.join(
                        "/etc",
                        "nginx",
                        "sites-enabled",
                        website.name + ".conf",
                    );
                    fs.rm(nginxConfigPath, (err) => {
                        if (err) {
                            console.error("Error deleting Nginx config:", err.message);
                        }

                        const { exec } = require("child_process");
                        exec("sudo systemctl restart nginx", (err) => {
                            if (err) console.error("Error restarting Nginx:", err);
                        });

                        res.redirect("/web/admin/subscriptions");
                    });
                },
            );
        },
    );
};

exports.getCreateSubscription = (req, res) => {
    db.all("SELECT id, username FROM users", (err, users) => {
        if (err) return res.status(500).send("Server error");

        db.all("SELECT id, name, status FROM nodes", (err, nodes) => {
            if (err) return res.status(500).send("Server error");

            res.render("web/admin/subscriptions/create", {
                users,
                nodes,
                user: req.session?.user,
                rank: req.session?.user?.rank,
            });
        });
    });
};

exports.createSubscription = (req, res) => {
    const { userId, nodeId, diskLimit, port, name } = req.body;

    if (!userId || !nodeId || !diskLimit || !port || !name) {
        return res.status(400).send("Missing fields!");
    }

    const uuid = crypto.randomUUID();

    // Fetch node info to use HaloProxy
    db.get("SELECT ip, port FROM nodes WHERE id = ?", [nodeId], (err, node) => {
        if (err || !node) {
            return res.status(400).send("Invalid node selection.");
        }

        const sql = `
        INSERT INTO websites (user_id, node_id, uuid, name, port, disk_limit)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

        db.run(sql, [userId, nodeId, uuid, name, port, diskLimit], async function (err) {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).send("Database error.");
            }

            try {
                // Initialize remote folder via HaloProxy
                const proxy = new HaloProxy(node.ip, node.port);
                await proxy.resetSite(uuid, 'php'); // Default to php for now

                // Nginx config (Master still handles Nginx proxying to nodes)
                // Note: filepath here is dummy or we need to rethink Nginx proxying.
                // Assuming Nginx on Master proxies to Node IP:Port.
                const dummyPath = `/dummy/path/${uuid}`;
                addDomain(name, dummyPath, (err) => {
                    if (err) console.error("Nginx error:", err);
                    return res.redirect("/web/admin/subscriptions");
                });
            } catch (proxyError) {
                console.error("HaloProxy error:", proxyError.message);
                // Even if Halo fails, we created the DB entry. We might want to rollback but keep it simple for now.
                return res.redirect("/web/admin/subscriptions");
            }
        });
    });
};

