// console.log("utils/SecretKey-generator.js loaded"); // To confirm that the page has been loaded correctly
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Generate a random Secret Key in config/config.json file
function generateKey() {
    const secretKey = crypto.randomUUID();
    const configPath = path.join(__dirname, "../../config/config.json");

    fs.readFile(configPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading config file: " + err.message);
            return;
        }

        let config;
        try {
            config = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing config file: " + parseErr.message);
            return;
        }

        // Check that session exists
        if (!config.session) config.session = {};

        if (!config.session.secret || config.session.secret === "secret-key") {
            config.session.secret = secretKey;
        }

        fs.writeFile(
            configPath,
            JSON.stringify(config, null, 2),
            (writeErr) => {
                if (writeErr) {
                    console.error(
                        "Error writing to config file: " + writeErr.message,
                    );
                    return;
                }
                console.log("Secret Key generated and saved successfully.");
            },
        );
    });
}

module.exports = {
    generateKey,
};
