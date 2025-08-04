![image](https://github.com/user-attachments/assets/5222bd49-29c6-4346-8a37-296a2ecb6e8c)

# LumenOne v1.1.0-bêta

| :exclamation: **LumenOne is under development**: some features may be unstable or incomplete. Its use in a production environment is strongly discouraged at this time. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**LumenOne** is a free and open-source alternative to Plesk, designed to simplify web hosting management (websites, domains, databases, FTP, emails, etc.) through a modern, intuitive, and lightweight interface. Developed in **Node.js**, LumenOne aims to provide a performant and extensible solution for developers and system administrators.

---

## :sparkles: Key Features (some feature not available now)

- :control_knobs: **Simple, responsive, and modern web interface**
- :globe_with_meridians: **Domain & subdomain management**
- :file_folder: **File management** (via SFTP/WebFTP)
- :dolphin: **Database management** (SQLite)
- :outbox_tray: **FTP account management**
- 📧 **Email management** (optional)
- :whale: **Docker integration** (optional for service isolation)
- :closed_lock_with_key: **Let's Encrypt SSL certificates**
- :jigsaw: **Module/extension system** for customization
- :arrows_counterclockwise: **REST API** for automation and integration

| ⚠️ LumenOne currently doesn't encrypt user passwords. This will be fixed in V.1.0.0, but for now, just don't leak your "lumenone.db". |
| ------------------------------------------------------------------------------------------------------------------------------------- |

---

## :rocket: Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **SQLite database** (default)
- Linux or Windows (recommended: Linux)
- **Nginx**

### Installation Steps

0. Go to :

   ```bash
   cd var/www/
   ```

1. Clone the repository:

   ```bash
   git clone https://github.com/lumenlabss/LumenOne.git
   cd LumenOne
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the `config/config.json` file:

   ```json
   {
     "hostname": "localhost",
     "port": 3000,
     "name": "LumenOne",
     "version": "Pre-Alpha"
   }
   ```

4. Start the server:

   ```bash
   node lumenone.js
   ```

5. Access the web interface:

   ```
   http://localhost:3000
   ```

6. Nginx Config:

   ```
   server {
    listen 80;
    server_name example.com;  # Replace with your domain

    # Redirect all HTTP requests to your Node.js application
        location / {
        proxy_pass http://localhost:3000;  # Replace with the port on which your Node.js app is listening
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
   }
   ```

---

## :page_facing_up: License

LumenOne is distributed under the **MIT** license. You are free to use, modify, and distribute it.

---

## :handshake: Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the project
2. Create a branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -am 'Add a new feature'`)
4. Push your changes (`git push origin feature/feature-name`)
5. Open a Pull Request

---

## :speech_balloon: Community

Join the LumenLabs community to ask questions, report bugs, or propose ideas:

- [GitHub Issues](https://github.com/lumenlabss/LumenOne/issues)
- [Discord](https://discord.gg/ty92ffCYUC)

---

## :tada: Acknowledgments

Thanks to all contributors and users who support the LumenOne project!

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lumenlabss/lumenone&type=Date)](https://www.star-history.com/#lumenlabss/lumenone&Date)
