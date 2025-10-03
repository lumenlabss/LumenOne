// console.log("pages/admin/modules.js loaded");

const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

//  Loading modules at startup
const modulesDir = path.join(__dirname, "../../../modules");
let modules = [];

try {
  const dirs = fs.readdirSync(modulesDir);

  for (const dir of dirs) {
    const modulePath = path.join(modulesDir, dir);

    if (fs.lstatSync(modulePath).isDirectory()) {
      const indexPath = path.join(modulePath, "index.js");
      const configPath = path.join(modulePath, "config.json");
      const iconPath = path.join(modulePath, "icon.png");

      // If index.js exists, we require it (execution)
      if (fs.existsSync(indexPath)) {
        try {
          require(indexPath);
        } catch (err) {
          console.error(`Error loading ${indexPath}`, err);
        }
      }

      // Read config.json
      let config = {};
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        } catch (err) {
          console.error(`Error parsing config.json for ${dir}`, err);
        }
      }

      // Check the icon
      const hasIcon = fs.existsSync(iconPath);

      modules.push({
        name: config.name || dir,
        version: config.version || "no version",
        description: config.description || "No description provided.",
        author: config.author || "Unknown",
        icon: hasIcon ? `/modules/${dir}/icon.png` : null,
      });
    }
  }
} catch (err) {
  console.error("Error while scanning modules :", err);
}

//  Module display path
router.get("/web/admin/modules", isAuthenticated, (req, res) => {
  res.render("web/admin/modules.ejs", {
    user: req.session.user,
    rank: req.session.user.rank,
    modules,
  });
});

module.exports = router;
