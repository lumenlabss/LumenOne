const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const os = require("os");
const si = require("systeminformation");

// Middleware d'authentification
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    const userId = req.session.user.id;

    db.get("SELECT rank FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        console.error("Rank verification error " + err.message);
        return res
          .status(500)
          .render("error/500.ejs", { message: "Internal server error" });
      }

      if (row && row.rank === "admin") {
        req.session.user.rank = row.rank;
        return next();
      }

      return res.status(403).render("error/403.ejs", {
        message: "Access denied. Admin only.",
      });
    });
  } else {
    res.redirect("/");
  }
}

// Route to system information page
// Route to system information page
router.get("/web/admin/information", isAuthenticated, async (req, res) => {
  try {
    const cpuData = await si.cpu();
    const memData = await si.mem();
    const memLayout = await si.memLayout(); // To get more detailed memory info
    const diskData = await si.diskLayout();
    const osInfo = await si.osInfo();
    const netData = await si.networkInterfaces();
    const uptime = os.uptime(); // in seconds

    const uptimeDays = Math.floor(uptime / 86400);
    const uptimeHours = Math.floor((uptime % 86400) / 3600);
    const bootTime = new Date(Date.now() - uptime * 1000);

    const CPUfrequence = cpuData.speed + " GHz";
    const CPUname = `${cpuData.manufacturer} ${cpuData.brand}`;
    const RAMtype = memLayout.length > 0 ? memLayout[0].type : "Unknown"; // Get the type from memLayout
    const RAMspeed =
      memLayout.length > 0 ? memLayout[0].speed + " MHz" : "Unknown"; // Get the speed from memLayout

    const cpuCores = cpuData.cores; // Physical cores
    const cpuThreads = cpuData.logical; // Threads or vCores

    res.render("web/admin/information.ejs", {
      user: req.session.user,
      rank: req.session.user.rank,

      // Adding all requested variables
      CPUname: CPUname,
      CPUarchitecture: os.arch(),
      CPUfrequence: CPUfrequence,

      RAMsize: Math.round(memData.total / 1024 / 1024 / 1024) + " GB",
      RAMtype: RAMtype, // Actual RAM type
      RAMspeed: RAMspeed, // Actual RAM speed

      StorageSize:
        diskData.length > 0
          ? (diskData[0].size / 1024 / 1024 / 1024).toFixed(0) + " GB"
          : "Unknown",
      StorageType: diskData.length > 0 ? diskData[0].interfaceType : "Unknown",

      OSname: osInfo.distro,
      Osversion: osInfo.release,
      KernelVersion: osInfo.kernel,

      NetworkIP: netData.length > 0 ? netData[0].ip4 : "Unknown",
      NetworkSpeed:
        netData.length > 0 ? netData[0].speed || "1 Gbps" : "Unknown",

      SystemUptime: `${uptimeDays} days, ${uptimeHours} hours`,
      LastBoot: bootTime.toLocaleString(),

      // Corrected the thread and core count
      CPUCores: cpuCores, // Cores (physiques)
      CPUThreads: cpuThreads, // Threads (ou vCores)
    });
  } catch (err) {
    console.error("System info retrieval error : " + err.message);
    res.status(500).render("error/500.ejs", {
      message: "Error retrieving system information.",
    });
  }
});

module.exports = router;
