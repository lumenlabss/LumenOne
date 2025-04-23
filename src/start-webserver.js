const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const db = require("./db.js");
const router = express.Router();
const createWS = require("./pages/admin/subscriptions/create.js");

let activeServers = createWS.activeServers || {};
console.log("start-webserver.js successfully loaded"); // debug

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

router.post("/web/restart/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  activeServers = createWS.activeServers;

  db.get("SELECT * FROM websites WHERE uuid = ?", [uuid], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: "Site not found." });
    }

    const folderPath = path.join(__dirname, "../storage/volumes", uuid);
    console.log("[DEBUG]: Path searched for restarting: " + folderPath); // debug

    const filePath = path.join(folderPath, "index.html");

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({
          error: "index.html not found. Path searched: " + filePath, // debug
        });
      }

      if (activeServers[uuid]) {
        activeServers[uuid].close(() => {
          console.log(`Old server for ${uuid} stopped.`); // debug
        });
      } else {
        console.log(`No active server found for ${uuid}, creating new one.`); // debug
      }

      const server = http.createServer((req2, res2) => {
        console.log("Server being used");
        const requestedFile =
          req2.url === "/" ? "index.html" : req2.url.slice(1);
        const requestedFilePath = path.join(folderPath, requestedFile);

        console.log(`[DEBUG]: Requested file: ${requestedFile}`); // debug

        fs.access(requestedFilePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(`[DEBUG]: File not found: ${requestedFilePath}`); // debug
            res2.statusCode = 404;
            res2.setHeader("Content-Type", "text/plain");
            res2.end(`${requestedFile} not found in the website directory.`);
            return;
          }

          fs.readFile(requestedFilePath, "utf8", (err, data) => {
            if (err) {
              res2.statusCode = 500;
              res2.setHeader("Content-Type", "text/plain");
              res2.end("Error reading file");
            } else {
              res2.setHeader("Content-Type", getContentType(requestedFile));
              res2.end(data);
            }
          });
        });
      });

      server.listen(row.port, () => {
        console.log(`Server for UUID=${uuid} restarted on port ${row.port}`);
        activeServers[uuid] = server;
        res.json({ success: true });
      });
    });
  });
});

// Function to restart all active servers on startup
function startAllActiveServers() {
  db.all("SELECT * FROM websites", (err, rows) => {
    if (err) {
      console.error("Error retrieving sites:", err.message);
      return;
    }

    rows.forEach((row) => {
      const folderPath = path.join(__dirname, "../storage/volumes", row.uuid);
      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (exists) {
          const server = http.createServer((req, res) => {
            fs.readFile(filePath, "utf8", (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.end("Error reading the file");
              } else {
                res.setHeader("Content-Type", "text/html");
                res.end(data);
              }
            });
          });
          activeServers[row.uuid] = server;
          console.log(
            "DEBUG: Added active server " + row.uuid + " to the list."
          );
          console.log("Here is the current state of the list: ");
          for (uuid in activeServers) {
            console.log(uuid);
          }
          server.listen(row.port, () => {
            console.log(
              `Server for UUID=${row.uuid} started on http://localhost:${row.port}`
            );
          });
        } else {
          console.log(
            `index.html file missing for site UUID=${row.uuid}, Port=${row.port}. Server not started.`
          );
        }
      });
    });
  });
}

startAllActiveServers();

module.exports = router;
module.exports.activeServers = activeServers;
