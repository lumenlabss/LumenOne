const db = require("../db.js");
const HaloProxy = require("../utils/haloProxy.js");

// Helper function to get node info for a website
const getWebsiteWithNode = (uuid, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT websites.*, nodes.ip as node_ip, nodes.port as node_port
            FROM websites
            LEFT JOIN nodes ON websites.node_id = nodes.id
            WHERE websites.uuid = ? AND websites.user_id = ?
        `;
        db.get(sql, [uuid, userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

exports.getEditFile = async (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;

    try {
        const website = await getWebsiteWithNode(websiteUuid, userId);
        if (!website) return res.status(404).render("error/404.ejs");

        if (!website.node_ip || !website.node_port) {
            return res.status(400).send("No node assigned to this website.");
        }

        const proxy = new HaloProxy(website.node_ip, website.node_port);
        let fileContent = "";

        try {
            fileContent = await proxy.readFile(websiteUuid, fileName);
        } catch (error) {
            if (req.query.new === "true") {
                await proxy.createFile(websiteUuid, fileName, "");
            } else {
                return res.status(404).render("error/404.ejs", { message: "File not found on node" });
            }
        }

        res.render("web/edit/files.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            error: null,
            websiteUuid,
            fileName,
            fileContent,
            website,
        });
    } catch (err) {
        console.error("getEditFile ERROR:", err.message);
        res.status(500).render("error/500.ejs");
    }
};

exports.saveFile = async (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;
    const fileName = req.params.file;
    const fileContent = req.body.content;

    if (fileContent === undefined) return res.status(400).send("No content provided");

    try {
        const website = await getWebsiteWithNode(websiteUuid, userId);
        if (!website) return res.status(404).render("error/500.ejs");

        if (!website.node_ip || !website.node_port) {
            return res.status(400).send("No node assigned to this website.");
        }

        const proxy = new HaloProxy(website.node_ip, website.node_port);
        await proxy.createFile(websiteUuid, fileName, fileContent);
        res.redirect(`/load?x=/web/manage/${websiteUuid}`);
    } catch (err) {
        console.error("saveFile ERROR:", err.message);
        res.status(500).render("error/500.ejs");
    }
};

exports.getFolderSize = async (req, res) => {
    const userId = req.session.user.id;
    const websiteUuid = req.params.id;

    try {
        const website = await getWebsiteWithNode(websiteUuid, userId);
        if (!website) return res.status(404).json({ error: "Website not found" });

        if (!website.node_ip || !website.node_port) {
            return res.status(400).json({ error: "No node assigned" });
        }

        const proxy = new HaloProxy(website.node_ip, website.node_port);
        const size = await proxy.getFolderSize(websiteUuid);
        res.json({ size });
    } catch (err) {
        console.error("getFolderSize ERROR:", err.message);
        res.status(500).json({ error: "Failed to get size" });
    }
};
