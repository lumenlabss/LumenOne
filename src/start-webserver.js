console.log("start-webserver.js loaded");

const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const db = require("./db.js");
const router = express.Router();
const createWS = require("./pages/admin/subscriptions/create.js");

// Keep track of active HTTP servers by UUID
let activeServers = createWS.activeServers || {};

// Path to statistics file for tracking visits
const statisticsFile = path.join(__dirname, "../storage/statistics.json");

/**
 * Returns the appropriate MIME content type based on file extension
 * @param {string} filename
 * @returns {string} MIME type
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

/**
 * Tracks visits per UUID by setting a cookie and updating statistics file
 * @param {string} uuid - Unique website identifier
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function trackVisit(uuid, req, res) {
  const cookieHeader = req.headers.cookie || "";
  const visitedKey = `visited_${uuid}`;
  const hasVisited = cookieHeader.includes(`${visitedKey}=true`);

  if (!hasVisited) {
    // Read statistics file
    fs.readFile(statisticsFile, "utf8", (err, data) => {
      let stats = {};

      if (!err && data) {
        try {
          stats = JSON.parse(data);
        } catch (parseErr) {
          console.error("Failed to parse statistics.json:", parseErr);
        }
      }

      // Increment visit count for the UUID
      stats[uuid] = (stats[uuid] || 0) + 1;

      // Write updated stats back to the file
      fs.writeFile(
        statisticsFile,
        JSON.stringify(stats, null, 2),
        (writeErr) => {
          if (writeErr)
            console.error("Error writing statistics file:", writeErr);
        }
      );
    });

    // Set a cookie to avoid counting multiple visits within 24h
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    res.setHeader(
      "Set-Cookie",
      `${visitedKey}=true; Expires=${expires}; Path=/`
    );
  }
}

/**
 * Route to restart a web server for a specific UUID
 * It stops any existing server, then creates a new one serving files from the UUID folder
 */
router.post("/web/restart/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  activeServers = createWS.activeServers; // Refresh reference to active servers

  // Fetch site info from the database
  db.get("SELECT * FROM websites WHERE uuid = ?", [uuid], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: "Site not found." });
    }

    const folderPath = path.join(__dirname, "../storage/volumes", uuid);
    const indexPath = path.join(folderPath, "index.html");

    // Verify that index.html exists
    fs.access(indexPath, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        return res.status(404).json({
          error: "index.html not found. Path searched: " + indexPath,
        });
      }

      // Close the old server if it exists
      if (activeServers[uuid]) {
        activeServers[uuid].close(() => {
          console.log(`Old server for ${uuid} stopped.`);
        });
      }

      // Create new HTTP server serving files from folderPath
      const server = http.createServer((req2, res2) => {
        trackVisit(uuid, req2, res2);

        // Determine requested file path, default to index.html
        const requestedFile =
          req2.url === "/"
            ? "index.html"
            : decodeURIComponent(req2.url.slice(1));
        const requestedFilePath = path.join(folderPath, requestedFile);

        // Check file existence
        fs.access(requestedFilePath, fs.constants.F_OK, (fileErr) => {
          if (fileErr) {
            res2.statusCode = 404;
            res2.setHeader("Content-Type", "text/plain");
            res2.end(`File ${requestedFile} not found.`);
            return;
          }

          // Read and serve file content
          fs.readFile(requestedFilePath, (readErr, data) => {
            if (readErr) {
              res2.statusCode = 500;
              res2.setHeader("Content-Type", "text/plain");
              res2.end("Internal server error.");
              return;
            }

            res2.statusCode = 200;
            res2.setHeader("Content-Type", getContentType(requestedFile));
            res2.end(data);
          });
        });
      });

      // Start listening on the specified port from DB
      server.listen(row.port, () => {
        console.log(`Server for UUID=${uuid} restarted on port ${row.port}`);
        activeServers[uuid] = server;
        res.json({ success: true });
      });
    });
  });
});

/**
 * Starts HTTP servers for all websites that have an index.html file
 * Reads all websites from the database and serves files accordingly
 */
function startAllActiveServers() {
  db.all("SELECT * FROM websites", (err, rows) => {
    if (err) {
      return console.error("Error retrieving sites:", err.message);
    }

    rows.forEach((row) => {
      const folderPath = path.join(__dirname, "../storage/volumes", row.uuid);
      const indexFilePath = path.join(folderPath, "index.html");

      fs.exists(indexFilePath, (exists) => {
        if (!exists) {
          console.log(
            `index.html missing for UUID=${row.uuid}, not starting server.`
          );
          return;
        }

        // Create HTTP server to serve files for this UUID
        const server = http.createServer((req, res) => {
          trackVisit(row.uuid, req, res);

          // Determine requested file path, default to index.html
          const requestedFile =
            req.url === "/"
              ? "index.html"
              : decodeURIComponent(req.url.slice(1));
          const requestedFilePath = path.join(folderPath, requestedFile);

          // Check file existence
          fs.access(requestedFilePath, fs.constants.F_OK, (fileErr) => {
            if (fileErr) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "text/plain");
              res.end(`File ${requestedFile} not found.`);
              return;
            }

            // Read and serve file content
            fs.readFile(requestedFilePath, (readErr, data) => {
              if (readErr) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/plain");
                res.end("Error reading file.");
              } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", getContentType(requestedFile));
                res.end(data);
              }
            });
          });
        });

        // Save active server and listen on its port
        activeServers[row.uuid] = server;
        server.listen(row.port, () => {
          console.log(
            `Server for UUID=${row.uuid} started on http://localhost:${row.port}`
          );
        });
      });
    });
  });
}

// Start all servers when this script loads
startAllActiveServers();

// Export router and activeServers reference
module.exports = router;
module.exports.activeServers = activeServers;
