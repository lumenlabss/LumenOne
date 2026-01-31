const os = require("os");
const systeminformation = require("systeminformation");
const db = require("../db.js");
const { modules } = require("../utils/moduleLoader.js");
const { getNetworkIP } = require("../utils/network.js");

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    else return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

exports.getInformation = async (req, res) => {
    try {
        const cpu = await systeminformation.cpu();
        const mem = await systeminformation.mem();
        const osInfo = await systeminformation.osInfo();
        const time = await systeminformation.time();
        const diskLayout = await systeminformation.diskLayout();
        const networkIP = await getNetworkIP();

        // Database stats
        const usersCount = await new Promise((resolve) =>
            db.get("SELECT COUNT(*) as count FROM users", (err, row) =>
                resolve(row ? row.count : 0),
            ),
        );
        const websitesCount = await new Promise((resolve) =>
            db.get("SELECT COUNT(*) as count FROM websites", (err, row) =>
                resolve(row ? row.count : 0),
            ),
        );
        const backupsCount = await new Promise((resolve) =>
            db.get("SELECT COUNT(*) as count FROM backups", (err, row) =>
                resolve(row ? row.count : 0),
            ),
        );

        res.render("web/admin/information.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            // CPU
            CPUname: `${cpu.manufacturer} ${cpu.brand}`,
            CPUfrequence: `${cpu.speed} GHz`,
            CPUCores: cpu.cores,
            // RAM
            RAMsize: formatBytes(mem.total),
            RAMtype: "DDR", // systeminformation.memLayout() could give more but this is fine
            RAMspeed: "",
            // Storage
            StorageSize:
                diskLayout.length > 0
                    ? formatBytes(diskLayout[0].size)
                    : "Unknown",
            StorageType: diskLayout.length > 0 ? diskLayout[0].type : "Unknown",
            // OS
            OSname: osInfo.distro,
            Osversion: osInfo.release,
            // Network
            NetworkIP: networkIP,
            NetworkSpeed: "N/A",
            // System
            SystemUptime: (os.uptime() / 3600).toFixed(2) + " Hours",
            LastBoot: new Date(time.uptime * 1000).toLocaleString(),
            // Overview
            updateAvailable: "None",
            totalUsers: usersCount,
            totalListWebsite: websitesCount,
            totalBackups: backupsCount,
            error: null,
        });
    } catch (error) {
        console.error("Error recovering system information:", error);
        res.render("web/admin/information.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            error: "Error retrieving system information.",
        });
    }
};

exports.getSettings = (req, res) => {
    db.all("SELECT * FROM apikey", (err, apiKeys) => {
        if (err) {
            console.error("Error retrieving API keys:", err.message);
            apiKeys = [];
        }

        res.render("web/admin/settings.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            apiKeys: apiKeys || [],
        });
    });
};

exports.getModules = (req, res) => {
    res.render("web/admin/modules.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
        modules,
    });
};
