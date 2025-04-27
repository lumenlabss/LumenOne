const fs = require("fs");
const { exec } = require("child_process");

function addDomain(name, port, callback) {
  const nginxConfig = `
server {
    listen ${port};
    server_name ${name};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;

  const configPath = `/etc/nginx/sites-enabled/${name}.conf`;

  console.log(
    `Attempting to write Nginx config for ${name} on port ${port}...`
  );

  // Vérification si le fichier existe
  fs.access(configPath, fs.constants.F_OK, (err) => {
    if (!err) {
      console.log(`The config file already exists at ${configPath}`);
    } else {
      console.log(
        `No existing config file at ${configPath}. Creating new one.`
      );
    }

    // Write the nginx config file
    fs.writeFile(configPath, nginxConfig, (err) => {
      if (err) {
        console.error("Failed to create nginx config:", err);
        if (callback) callback(err);
        return;
      }

      console.log(`Nginx config successfully written to ${configPath}.`);

      // Reload Nginx service
      console.log("Attempting to reload Nginx...");
      exec("systemctl reload nginx", (error, stdout, stderr) => {
        if (error) {
          console.error(`Reload error: ${error.message}`);
          if (callback) callback(error);
          return;
        }
        if (stderr) {
          console.error(`Reload stderr: ${stderr}`);
        }
        console.log("Nginx reloaded successfully.");
        if (callback) callback(null);
      });
    });
  });
}

module.exports = { addDomain };
