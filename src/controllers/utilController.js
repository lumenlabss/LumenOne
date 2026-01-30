const { getNetworkIP } = require("../utils/network.js");

exports.loadRedirect = (req, res) => {
    // Handling /load/:x
    const x = req.params.x;
    if (x) {
        return res.redirect(`/${x}`);
    }
    // Handling /load via query param if needed or fallback
    if (req.query.x) {
        return res.redirect(`${req.query.x}`);
    }
    res.render("load.ejs", { error: null });
};

exports.getLoadPage = (req, res) => {
    // If query param x exists
    if (req.query.x) {
        return res.redirect(`${req.query.x}`);
    }
    res.render("load.ejs", { error: null });
};

exports.getIp = async (req, res) => {
    try {
        const ip = await getNetworkIP();
        res.json({ ip });
    } catch (e) {
        console.error("Error getting network IP:", e);
        res.status(500).json({ error: "Failed to get IP" });
    }
};
