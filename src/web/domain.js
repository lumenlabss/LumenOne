const fs = require("fs");
const { exec } = require("child_process");

function addDomain(name, port, callback) {
  const nginxConfig = `
server {
    listen 80;
    server_name ${name};

    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;

  const configPath = `/etc/nginx/sites-enabled/${name}.conf`;

  fs.writeFile(configPath, nginxConfig, (err) => {
    if (err) {
      console.error("Failed to create nginx config:", err);
      if (callback) callback(err);
      return;
    }

    console.log("Nginx config created, reloading nginx...");
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
}

module.exports = { addDomain };
