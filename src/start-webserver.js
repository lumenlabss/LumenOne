const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const db = require("./db.js");
const router = express.Router();
const createWS = require("./pages/admin/subscriptions/create.js");
// Le router est importé normalement
let activeServers = createWS.activeServers || {};
console.log("start-webserver.js succesfully loaded i guess");
router.post("/web/restart/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  activeServers = createWS.activeServers;
  db.get("SELECT * FROM websites WHERE uuid = ?", [uuid], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: "Site not found." });
    }

    const folderPath = path.join(__dirname, "../storage/volumes", uuid);
    console.log("[DEBUG]: Path searched for restarting: " + folderPath);
    const filePath = path.join(folderPath, "index.html");

    fs.exists(filePath, (exists) => {
      if (!exists) {
        return res.status(404).json({
          error: "index.html not found." + "path searched:" + filePath,
        });
      }

      activeServers = createWS.activeServers;
      if (activeServers[uuid]) {
        activeServers[uuid].close(() => {
          console.log(`Old server for ${uuid} stopped.`);
        });
      } else {
        console.log(`No active server found for ${uuid}, creating new one.`);
      }

      const server = http.createServer((req, res) => {
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end("Error reading file");
          } else {
            res.setHeader("Content-Type", "text/html");
            res.end(data);
          }
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

module.exports = router;
