const fs = require("fs");
const path = require("path");
const { generateKey } = require("./../utils/SecretKey-generator.js");

// Config paths
const envPath = path.join(__dirname, "../../.env");
const envExamplePath = path.join(__dirname, "../../.env.example");
const configJsonPath = path.join(__dirname, "../../config/config.json");

// Auto-generate ENV if necessary

function createEnvFile() {
    if (!fs.existsSync(envExamplePath)) {
        console.error(
            "Error: .env.example not found. Cannot auto-generate .env",
        );
    }

    try {
        let envContent = fs.readFileSync(envExamplePath, "utf8");

        // Generate a secure random SESSION_SECRET
        const sessionSecret = generateKey();

        // Replace placeholders
        envContent = envContent.replace(
            /SESSION_SECRET=.*$/m,
            `SESSION_SECRET=${sessionSecret}`,
        );

        fs.writeFileSync(envPath, envContent, "utf8");

        console.log("\n" + "=".repeat(70));
        console.log("LumenOne - First Setup");
        console.log("\n" + "=".repeat(70));
        console.log("Created .env file with secure defaults.");
        console.log(
            "Please review and adjust the settings in .env as needed before restarting the application.\n",
        );
        console.log("\n" + "=".repeat(70));

        return true;
    } catch (err) {
        console.error("Error creating .env file:", err.message);
        return false;
    }
}

if (!fs.existsSync(envPath) && !fs.existsSync(configJsonPath)) {
    createEnvFile();
}

require("dotenv").config({ path: envPath });

// Backward compatibility with config.json
let jsonConfig = {};

if (fs.existsSync(configJsonPath)) {
    // Load config.json first
    try {
        const configData = fs.readFileSync(
            path.join(__dirname, "../../config/config.json"),
            "utf8",
        );
        jsonConfig = JSON.parse(configData);

        if (fs.existsSync(envPath)) {
            console.warn("Both .env and config.json found.");
            console.warn("Using .env (config.json is deprecated)");
        } else {
            console.warn("[DEPRECATED] Using config.json");
            console.warn("Please migrate to .env for better security");
        }
    } catch (err) {
        console.error("Error reading or parsing config.jsson:", err.message);
        process.exit(1);
    }
}

/**
 * Parse boolean values from strings or booleans.
 * It's mainly for environment variables.
 *
 * @param {string|boolean} value
 * @param {boolean} defaultValue
 * @returns
 */
function parseBoolean(value, defaultValue) {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return defaultValue;
}

// Merge configurations with precedence: ENV > config.json > defaults
const config = {
    hostname: process.env.SERVER_HOST || jsonConfig.hostname || "localhost",
    port: parseInt(process.env.PORT) || jsonConfig.port || 3000,
    name: process.env.APP_NAME || jsonConfig.name || "LumenOne",
    version: process.env.APP_VERSION || jsonConfig.version || "1.3.0-bêta",

    session: {
        secret:
            process.env.SESSION_SECRET ||
            jsonConfig.session?.secret ||
            generateKey(),
        resave: parseBoolean(
            process.env.SESSION_RESAVE || jsonConfig.session?.resave || false,
        ),
        saveUninitialized: parseBoolean(
            process.env.SESSION_SAVE_UNINITIALIZED ||
                jsonConfig.session?.saveUninitialized ||
                false,
        ),
        cookie: {
            secure: parseBoolean(
                process.env.SESSION_COOKIE_SECURE ||
                    jsonConfig.session?.cookie?.secure ||
                    false,
            ),
        },
    },

    rateLimit: {
        global: {
            windowMinutes: parseInt(
                process.env.RATE_LIMIT_GLOBAL_WINDOW ||
                    jsonConfig.rateLimit?.global?.windowMinutes ||
                    15,
            ),
            max: parseInt(
                process.env.RATE_LIMIT_GLOBAL_MAX ||
                    jsonConfig.rateLimit?.global?.max ||
                    100,
            ),
        },
        auth: {
            windowMinutes: parseInt(
                process.env.RATE_LIMIT_AUTH_WINDOW ||
                    jsonConfig.rateLimit?.auth?.windowMinutes ||
                    15,
            ),
            max: parseInt(
                process.env.RATE_LIMIT_AUTH_MAX ||
                    jsonConfig.rateLimit?.auth?.max ||
                    50,
            ),
        },
    },
};

console.log("Configuration loaded");

module.exports = config;
