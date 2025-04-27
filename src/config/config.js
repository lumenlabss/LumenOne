const fs = require("fs");
const path = require("path");

let config;

try {
  const configData = fs.readFileSync(
    path.join(__dirname, "../../config/config.json"),
    "utf8"
  );
  config = JSON.parse(configData);
  console.log("Configuration loaded:", config);
} catch (err) {
  console.error("Error reading or parsing config.json:", err);
  process.exit(1);
}

module.exports = config;
