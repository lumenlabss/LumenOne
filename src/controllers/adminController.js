const os = require("os");
const systeminformation = require("systeminformation");
const { modules } = require("../utils/moduleLoader.js"); // We use the pre-loaded modules

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
        const currentLoad = await systeminformation.currentLoad();

        res.render("web/admin/information.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            systemInfo: {
                cpu: `${cpu.manufacturer} ${cpu.brand}`,
                cores: `${cpu.cores} Cores`,
                ramTotal: formatBytes(mem.total),
                ramUsed: formatBytes(mem.active),
                ramFree: formatBytes(mem.available),
                os: `${osInfo.distro} ${osInfo.release}`,
                uptime: (os.uptime() / 3600).toFixed(2) + " Hours",
                cpuLoad: currentLoad.currentLoad.toFixed(2) + "%",
            },
            error: null,
        });
    } catch (error) {
        console.error("Error recovering system information:", error);
        res.render("web/admin/information.ejs", {
            user: req.session.user,
            rank: req.session.user.rank,
            systemInfo: null,
            error: "Error retrieving system information.",
        });
    }
};

exports.getSettings = (req, res) => {
    res.render("web/admin/settings.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
    });
};

exports.getModules = (req, res) => {
    res.render("web/admin/modules.ejs", {
        user: req.session.user,
        rank: req.session.user.rank,
        modules,
    });
};
