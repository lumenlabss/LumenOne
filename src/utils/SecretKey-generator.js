// console.log("utils/SecretKey-generator.js loaded"); // To confirm that the page has been loaded correctly
const crypto = require("crypto");

// Generate a random Secret Key in config/config.json file
function generateKey() {
    return crypto.randomUUID();
}

module.exports = {
    generateKey,
};
