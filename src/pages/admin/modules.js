console.log("pages/admin/modules.js loaded");

const express = require("express");
const db = require("../../db.js");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { isAuthenticated } = require("../../middleware/auth-admin.js");

router.get("/web/admin/modules", isAuthenticated, async (req, res) => {
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

        // If index.js exists, we require it.
        if (fs.existsSync(indexPath)) {
          try {
            require(indexPath); // executes the module
          } catch (err) {
            console.error(`Error loading ${indexPath}`, err);
          }
        }

        // Reading config.json
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
          version: config.version || "1.0.0",
          icon: hasIcon ? `/modules/${dir}/icon.png` : null,
        });
      }
    }
  } catch (err) {
    console.error("Error while scanning modules :", err);
  }

  // Render the page with the modules
  res.render("web/admin/modules.ejs", {
    user: req.session.user,
    rank: req.session.user.rank,
    modules,
  });
});

module.exports = router;
