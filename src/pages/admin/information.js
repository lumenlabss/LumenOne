console.log("pages/admin/information.js loaded"); // To confirm that the page has been loaded correctly
const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const os = require("os");
const si = require("systeminformation");
const getLumenOneOverviewData = require("../../utils/version-checker");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

// Route to system information page
router.get("/web/admin/information", isAuthenticated, async (req, res) => {
  try {
    const cpuData = await si.cpu();
    const memData = await si.mem();
    const memLayout = await si.memLayout();
    const diskData = await si.diskLayout();
    const osInfo = await si.osInfo();
    const netData = await si.networkInterfaces();
    const uptime = os.uptime();
    const { localVersion, latestVersion, updateAvailable } =
      await getLumenOneOverviewData();

    const uptimeDays = Math.floor(uptime / 86400);
    const uptimeHours = Math.floor((uptime % 86400) / 3600);
    const bootTime = new Date(Date.now() - uptime * 1000);

    const CPUfrequence = cpuData.speed + " GHz";
    const CPUname = `${cpuData.manufacturer} ${cpuData.brand}`;
    const RAMtype = memLayout.length > 0 ? memLayout[0].type : "Unknown";
    const RAMspeed =
      memLayout.length > 0 ? memLayout[0].speed + " MHz" : "Unknown";

    const cpuCores = cpuData.cores;
    const cpuThreads = cpuData.logical;

    // Storage detection
    let storageSize = "Unknown";
    let storageMainType = "Unknown"; // HDD / SSD
    let storageInterface = "Unknown"; // SATA / NVMe / etc.

    if (diskData.length > 0) {
      const disk = diskData[0];
      storageSize = (disk.size / 1024 / 1024 / 1024).toFixed(0) + " GB";

      if (disk.type === "SSD") {
        storageMainType = "SSD";
      } else if (disk.type === "HD") {
        storageMainType = "HDD";
      }

      storageInterface = disk.interfaceType || "Unknown";
    }

    const sql = `
      SELECT websites.*, users.username 
      FROM websites 
      JOIN users ON websites.user_id = users.id
    `;

    const allWebsites = await new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const totalListWebsite = allWebsites.length;

    const totalUsers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });

    res.render("web/admin/information.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,
      websites: allWebsites,
      totalListWebsite: totalListWebsite,
      totalUsers: totalUsers,
      appVersion: localVersion,
      newVersion: latestVersion,
      updateAvailable: updateAvailable
        ? "Your version is out of date"
        : "Your version is up-to-date",

      CPUname: CPUname,
      CPUarchitecture: os.arch(),
      CPUfrequence: CPUfrequence,

      RAMsize: Math.round(memData.total / 1024 / 1024 / 1024) + " GB",
      RAMtype: RAMtype,
      RAMspeed: RAMspeed,

      StorageSize:
        storageSize +
        (storageMainType !== "Unknown" ? ` ${storageMainType}` : ""),
      StorageType: storageInterface,

      OSname: osInfo.distro,
      Osversion: osInfo.release,
      KernelVersion: osInfo.kernel,

      NetworkIP: netData.length > 0 ? netData[0].ip4 : "Unknown",
      NetworkSpeed:
        netData.length > 0 ? netData[0].speed || "1 Gbps" : "Unknown",

      SystemUptime: `${uptimeDays} days, ${uptimeHours} hours`,
      LastBoot: bootTime.toLocaleString(),

      CPUCores: cpuCores,
      CPUThreads: cpuThreads,
    });
  } catch (err) {
    console.error("System info retrieval error : " + err.message);
    res.status(500).render("error/500.ejs", {
      message: "Error retrieving system information.",
    });
  }
});

module.exports = router;
