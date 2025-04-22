const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const db = require("./db.js");
const router = express.Router();
const createWS = require("./pages/admin/subscriptions/create.js");

let activeServers = createWS.activeServers || {};
console.log("start-webserver.js successfully loaded"); //debug

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
          error: "index.html not found. Path searched: " + filePath, //debug
        });
      }

      if (activeServers[uuid]) {
        activeServers[uuid].close(() => {
          console.log(`Old server for ${uuid} stopped.`); // debug
        });
      } else {
        console.log(`No active server found for ${uuid}, creating new one.`); //debug
      }

      const server = http.createServer((req, res) => {
        console.log("Server being used");
        // Extrait le fichier demandé dans l'URL, ou utilise 'index.html' par défaut
        const requestedFile = req.url === "/" ? "index.html" : req.url.slice(1); // Slice pour enlever le '/' initial
        const requestedFilePath = path.join(folderPath, requestedFile);

        console.log(`[DEBUG]: Requested file: ${requestedFile}`); // debug + NE VIENS JAMAIS CAR C DROLE

        // Vérifie si le fichier existe
        fs.access(requestedFilePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(`[DEBUG]: File not found: ${requestedFilePath}`); // debug
            return res.status(404).json({
              error: `${requestedFile} not found in the website directory.`,
            });
          }

          // Lit le fichier et le retourne en réponse
          fs.readFile(requestedFilePath, "utf8", (err, data) => {
            if (err) {
              res.statusCode = 500;
              res.end("Error reading file");
            } else {
              res.setHeader("Content-Type", "text/html");
              res.end(data);
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

module.exports = router;
