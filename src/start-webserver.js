const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const db = require("./db.js");
const router = express.Router();
const createWS = require("./pages/admin/subscriptions/create.js");

let activeServers = createWS.activeServers || {}; // that's a trash way to do it but hey i mean it works (David Goodenough ykyk)
console.log("start-webserver.js successfully loaded");

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
    if (err || !row) return res.status(404).json({ error: "Site not found." });

    const folderPath = path.join(__dirname, "../storage/volumes", uuid);
    const indexPath = path.join(folderPath, "index.html");

    fs.access(indexPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({
          error: "index.html not found. Path searched: " + indexPath,
        });
      }

      if (activeServers[uuid]) {
        activeServers[uuid].close(() => {
          console.log(`Old server for ${uuid} stopped.`);
        });
      }

      const server = http.createServer((req2, res2) => {
        const requestedFile =
          req2.url === "/"
            ? "index.html"
            : decodeURIComponent(req2.url.slice(1));
        const requestedFilePath = path.join(folderPath, requestedFile);

        fs.access(requestedFilePath, fs.constants.F_OK, (err) => {
          if (err) {
            res2.statusCode = 404;
            res2.setHeader("Content-Type", "text/plain");
            res2.end(`File ${requestedFile} not found.`);
            return;
          }

          fs.readFile(requestedFilePath, (err, data) => {
            if (err) {
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

      server.listen(row.port, () => {
        console.log(`Server for UUID=${uuid} restarted on port ${row.port}`);
        activeServers[uuid] = server;
        res.json({ success: true });
      });
    });
  });
});

// startAllActiveServers()
function startAllActiveServers() {
  db.all("SELECT * FROM websites", (err, rows) => {
    if (err) return console.error("Error retrieving sites:", err.message);

    rows.forEach((row) => {
      const folderPath = path.join(__dirname, "../storage/volumes", row.uuid);
      const filePath = path.join(folderPath, "index.html");

      fs.exists(filePath, (exists) => {
        if (exists) {
          const server = http.createServer((req, res) => {
            const requestedFile =
              req.url === "/"
                ? "index.html"
                : decodeURIComponent(req.url.slice(1));
            const requestedFilePath = path.join(folderPath, requestedFile);

            fs.access(requestedFilePath, fs.constants.F_OK, (err) => {
              if (err) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "text/plain");
                res.end(`File ${requestedFile} not found.`);
                return;
              }

              fs.readFile(requestedFilePath, (err, data) => {
                if (err) {
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

          activeServers[row.uuid] = server;
          server.listen(row.port, () => {
            console.log(
              `Server for UUID=${row.uuid} started on http://localhost:${row.port}`
            );
          });
        } else {
          console.log(
            `index.html missing for UUID=${row.uuid}, not starting server.`
          );
        }
      });
    });
  });
}

startAllActiveServers();

module.exports = router;
module.exports.activeServers = activeServers;
