console.log("pages/admin/information.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const os = require("os");
const si = require("systeminformation");
const getLumenOneOverviewData = require("../../utils/version-checker");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

// Helpers for DB (promises)
function dbGet(sql) {
  return new Promise((resolve, reject) => {
    db.get(sql, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Route to system information page
router.get("/web/admin/information", isAuthenticated, async (req, res) => {
  try {
    const [
      cpuData,
      memData,
      memLayout,
      diskData,
      osInfo,
      netData,
      overviewData,
    ] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.memLayout(),
      si.diskLayout(),
      si.osInfo(),
      si.networkInterfaces(),
      getLumenOneOverviewData(),
    ]);

    const allWebsites = await dbAll(`
      SELECT websites.*, users.username 
      FROM websites 
      JOIN users ON websites.user_id = users.id
    `);
    const totalUsers = (await dbGet("SELECT COUNT(*) AS count FROM users"))
      .count;
    const totalBackups = (await dbGet("SELECT COUNT(*) AS count FROM backups"))
      .count;

    const uptime = os.uptime();
    const bootTime = new Date(Date.now() - uptime * 1000);

    res.render("web/admin/information.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,
      websites: allWebsites,
      totalListWebsite: allWebsites.length,
      totalUsers,
      totalBackups,
      appVersion: overviewData.localVersion,
      newVersion: overviewData.latestVersion,
      updateAvailable: overviewData.updateAvailable
        ? "Your version is out of date"
        : "Your version is up-to-date",

      CPUname: `${cpuData.manufacturer} ${cpuData.brand}`,
      CPUarchitecture: os.arch(),
      CPUfrequence: cpuData.speed + " GHz",
      CPUCores: cpuData.cores,
      CPUThreads: cpuData.logical,

      RAMsize: `${Math.round(memData.total / 1024 / 1024 / 1024)} GB`,
      RAMtype: memLayout[0]?.type || "Unknown",
      RAMspeed: memLayout[0]?.speed ? `${memLayout[0].speed} MHz` : "Unknown",

      StorageSize: diskData[0]
        ? `${(diskData[0].size / 1024 / 1024 / 1024).toFixed(0)} GB ${
            diskData[0].type
          }`
        : "Unknown",
      StorageType: diskData[0]?.interfaceType || "Unknown",

      OSname: osInfo.distro,
      Osversion: osInfo.release,
      KernelVersion: osInfo.kernel,

      NetworkIP: netData[0]?.ip4 || "Unknown",
      NetworkSpeed: netData[0]?.speed
        ? netData[0].speed >= 1000
          ? netData[0].speed / 1000 + " Gbps"
          : netData[0].speed + " Mbps"
        : "Unknown",

      SystemUptime: `${Math.floor(uptime / 86400)} days, ${Math.floor(
        (uptime % 86400) / 3600
      )} hours`,
      LastBoot: bootTime.toLocaleString(),
    });
  } catch (err) {
    console.error("System info retrieval error : " + err.message);
    res.status(500).render("error/500.ejs", {
      message: "Error retrieving system information.",
    });
  }
});

module.exports = router;
