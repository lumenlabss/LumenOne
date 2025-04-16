const express = require("express");
const path = require("path");
const fs = require("fs");

const sitePath = path.join(__dirname, "storage/volumes");
const db = require("../db"); // sql file

db.all("SELECT * FROM containers", (err, containers) => {
  if (err) return console.error("ERROR DB:", err);

  containers.forEach((container) => {
    const app = express();
    const folderPath = path.join(sitePath, container.container_name);

    if (!fs.existsSync(folderPath)) {
      console.warn(`Missing file : ${folderPath}`);
      return;
    }

    app.use(express.static(folderPath));

    app.listen(container.ports, () => {
      console.log(
        `Website ${container.container_name} in http://localhost:${container.ports}` // debug
      );
    });
  });
});
