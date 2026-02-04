const db = require("../db.js");
const HaloProxy = require("../utils/haloProxy.js");

exports.getManageWebsite = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;

    const sql = `
        SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port, users.rank
        FROM websites 
        JOIN users ON websites.user_id = users.id
        LEFT JOIN nodes ON websites.node_id = nodes.id
        WHERE websites.uuid = ? AND websites.user_id = ?
    `;

    db.get(sql, [websiteUuid, userId], async (err, website) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).render("error/500.ejs");
        }
        if (!website) {
            return res.status(404).render("error/404.ejs");
        }

        let files = [];
        if (website.node_ip && website.node_port) {
            try {
                const proxy = new HaloProxy(website.node_ip, website.node_port);
                files = await proxy.listFiles(websiteUuid);
            } catch (proxyError) {
                console.error("HaloProxy listFiles error:", proxyError.message);
                // Optionally show a warning in the UI that node is unreachable
            }
        }

        res.render("web/manage.ejs", {
            user: req.session.user,
            website,
            rank: website.rank,
            websiteUuid,
            files,
            NetworkIP: website.node_ip || "Unknown",
        });
    });
};

exports.createFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const filename = req.body.filename;

    if (!filename || filename.includes("..") || filename.includes("/") || filename.length > 100) {
        return res.status(400).send("Invalid file name.");
    }

    const sql = `
        SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port
        FROM websites 
        LEFT JOIN nodes ON websites.node_id = nodes.id
        WHERE uuid = ? AND user_id = ?
    `;

    db.get(sql, [websiteUuid, userId], async (err, website) => {
        if (err || !website) return res.status(404).send("Website not found.");

        if (website.node_ip && website.node_port) {
            try {
                const proxy = new HaloProxy(website.node_ip, website.node_port);
                await proxy.createFile(websiteUuid, filename);
                res.redirect(`/web/manage/${websiteUuid}`);
            } catch (proxyError) {
                console.error("HaloProxy createFile error:", proxyError.message);
                res.status(500).send("Failed to create file on node.");
            }
        } else {
            res.status(400).send("No node assigned to this website.");
        }
    });
};

exports.deleteFile = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileToDelete = req.params.file;

    if (!fileToDelete || fileToDelete.includes("..") || fileToDelete.includes("/")) {
        return res.status(400).send("Invalid file name.");
    }

    const sql = `
        SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port
        FROM websites 
        LEFT JOIN nodes ON websites.node_id = nodes.id
        WHERE uuid = ? AND user_id = ?
    `;

    db.get(sql, [websiteUuid, userId], async (err, website) => {
        if (err || !website) return res.status(404).send("Website not found.");

        if (website.node_ip && website.node_port) {
            try {
                const proxy = new HaloProxy(website.node_ip, website.node_port);
                await proxy.deleteFile(websiteUuid, fileToDelete);
                res.redirect(`/web/manage/${websiteUuid}`);
            } catch (proxyError) {
                console.error("HaloProxy deleteFile error:", proxyError.message);
                res.status(500).send("Failed to delete file on node.");
            }
        } else {
            res.status(400).send("No node assigned to this website.");
        }
    });
};

exports.resetWebsite = (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const engine = req.query.engine || "php";

    const sql = `
        SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port
        FROM websites 
        LEFT JOIN nodes ON websites.node_id = nodes.id
        WHERE uuid = ? AND user_id = ?
    `;

    db.get(sql, [websiteUuid, userId], async (err, website) => {
        if (err || !website) return res.status(404).send("Website not found.");

        if (website.node_ip && website.node_port) {
            try {
                const proxy = new HaloProxy(website.node_ip, website.node_port);
                await proxy.resetSite(websiteUuid, engine);

                // Update engine in DB
                db.run("UPDATE websites SET engine = ? WHERE uuid = ?", [engine, websiteUuid]);

                res.redirect(`/web/manage/${websiteUuid}`);
            } catch (proxyError) {
                console.error("HaloProxy reset error:", proxyError.message);
                res.status(500).send("Failed to reset site on node.");
            }
        } else {
            res.status(400).send("No node assigned to this website.");
        }
    });
};

