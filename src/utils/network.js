console.log("utils/network.js loaded"); // To confirm that the page has been loaded correctly
const si = require("systeminformation");

async function getNetworkIP() {
  try {
    const netData = await si.networkInterfaces();
    return netData.length > 0 ? netData[0].ip4 : "Unknown";
  } catch (e) {
    return "Unknown";
  }
}

module.exports = { getNetworkIP };
