const fs = require("fs");
const { exec } = require("child_process");

function addDomain(name, filepath, callback) {
    // Checks if PHP is installed
    exec("php -v", (phpErr, stdout, stderr) => {
        const phpInstalled = !phpErr;
        let phpBlock = "";

        if (phpInstalled) {
            // Extract installed PHP version
            const match = stdout.match(/PHP (\d+\.\d+)/);
            const version = match ? match[1] : "8.1"; // fallback to 8.1 if not detected

            phpBlock = `
    location ~ \\.php$ {
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php${version}-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \\n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }`;
        }

        const nginxConfig = `
server {
    listen 80;
    server_name ${name};

    root ${filepath};
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }${phpBlock}
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
    });
}

module.exports = { addDomain };
