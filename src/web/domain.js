const fs = require("fs");
const { exec } = require("child_process");

function addDomain(name, nodeIp, port, callback) {
    const nginxConfig = `
server {
    listen 80;
    server_name ${name};

    location / {
        proxy_pass http://${nodeIp}:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

    const configPath = `/etc/nginx/sites-enabled/${name}.conf`;

    fs.writeFile(configPath, nginxConfig, (err) => {
        if (err) {
            console.error("Failed to create nginx config:", err);
            if (callback) callback(err);
            return;
        }

        console.log(
            `Nginx config written to ${configPath}. Reloading Nginx...`,
        );

        exec("nginx -s reload", (reloadErr, stdout, stderr) => {
            if (reloadErr) {
                console.error(`Reload error: ${reloadErr.message}`);
                if (callback) callback(reloadErr);
                return;
            }
            if (stderr) console.error(`Reload stderr: ${stderr}`);
            console.log("Nginx reloaded successfully.");
            if (callback) callback(null);
        });
    });
};

module.exports = { addDomain };
