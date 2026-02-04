const express = require("express");
const db = require("./db.js");
const HaloProxy = require("./utils/haloProxy.js");
const router = express.Router();

/**
 * Route to restart a web server for a specific UUID (DISTRIBUTED)
 * It tells the assigned Halo node to restart the site.
 */
router.post("/web/restart/:uuid", (req, res) => {
    const uuid = req.params.uuid;

    const sql = `
        SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port
        FROM websites 
        LEFT JOIN nodes ON websites.node_id = nodes.id
        WHERE uuid = ?
    `;

    db.get(sql, [uuid], async (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: "Site not found." });
        }

        if (row.node_ip && row.node_port) {
            try {
                const proxy = new HaloProxy(row.node_ip, row.node_port);
                await proxy.restartSite(uuid, row.port);
                res.json({ success: true });
            } catch (proxyError) {
                console.error("Distributed restart error:", proxyError.message);
                res.status(500).json({ error: "Failed to restart on remote node." });
            }
        } else {
            res.status(400).json({ error: "No node assigned." });
        }
    });
});

/**
 * In a distributed setup, the Master doesn't start all servers locally.
 * Instead, it could (optionally) ping all nodes to ensure they start their sites,
 * but usually sites start on demand or persist on nodes.
 */
function startAllActiveServers() {
    console.log("Distributed mode: Master is not starting local site servers.");
}

// Start sequence (silent on Master)
startAllActiveServers();

module.exports = router;
module.exports.activeServers = {}; // Provided for compatibility but empty
