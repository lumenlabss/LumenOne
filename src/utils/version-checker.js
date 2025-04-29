console.log("version-checker.js loaded"); // To confirm that the page has been loaded correctly
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const localConfigPath = path.join(__dirname, "../../config/config.json");

async function getLumenOneOverviewData() {
  const config = JSON.parse(fs.readFileSync(localConfigPath, "utf8"));
  const localVersion = config.version || "Unknown";
  let latestVersion = "Unavailable";
  let updateAvailable = false;

  try {
    const response = await axios.get(
      "https://lumenlabs.pro/version/lumenone.html" //isn't work now because I haven't created the page yet, but normally this weekend it will be created
    );
    latestVersion = response.data.trim();

    updateAvailable = localVersion !== latestVersion;
  } catch (err) {
    console.error("Error verifying version :", err.message);
  }

  return {
    localVersion,
    latestVersion,
    updateAvailable,
  };
}

module.exports = getLumenOneOverviewData;
