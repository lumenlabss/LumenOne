const express = require("express");
const router = express.Router();
const utilController = require("../controllers/utilController.js");
const { isAuthenticated } = require("../middleware/auth.js");

const db = require("../db.js");

router.get("/load/:x", utilController.loadRedirect);
router.get("/load", utilController.getLoadPage);
router.get("/web/get-ip", isAuthenticated, utilController.getIp);

router.post("/api/halo/heartbeat", (req, res) => {
    const { name, status, last_seen, ip, port } = req.body;
    const nodeIp = ip || req.ip;

    if (!name) return res.status(400).send("Node name is required.");

    db.run(
        `INSERT INTO nodes (name, ip, port, status, last_seen) 
         VALUES (?, ?, ?, ?, ?) 
         ON CONFLICT(name) DO UPDATE SET 
         ip = excluded.ip, 
         port = excluded.port,
         status = excluded.status, 
         last_seen = excluded.last_seen`,
        [
            name,
            nodeIp,
            port || 4000,
            status || "online",
            last_seen || new Date().toISOString(),
        ],
        (err) => {
            if (err) {
                console.error("Heartbeat error:", err.message);
                return res.status(500).send("Database error.");
            }
            res.send("Heartbeat received.");
        },
    );
});

module.exports = router;
