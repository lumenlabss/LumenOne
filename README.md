![image](https://github.com/user-attachments/assets/5222bd49-29c6-4346-8a37-296a2ecb6e8c)

# LumenOne v1.3.0-bêta

**LumenOne** is a free and open-source alternative to Plesk, designed to simplify web hosting management (websites, domains, databases, FTP, emails, etc.) through a modern, intuitive, and lightweight interface. Developed in **Node.js**, LumenOne aims to provide a performant and extensible solution for developers and system administrators.

---

## :sparkles: Key Features

| Features                                     | Description                                  | Status                    |
| -------------------------------------------- | -------------------------------------------- | ------------------------- |
| :control_knobs: **Modern UI**                | Simple, responsive, and modern web interface | ✅ **Implemented**        |
| :globe_with_meridians: **Domain Management** | Allow to manage domains & subdomains         | 🛠️ **In development**     |
| :file_folder: **Files Management**           | WebFTP/SFTP access                           | 🛠️ **Partial** _(WebFTP)_ |
| :dolphin: **Database Management**            | Database Management (SQLite)                 | 📝 **Planned**            |
| :outbox_tray: **FTP Account Management**     | Create/Manage user FTP                       | 📝 **Planned**            |
| 📧 **Email Management**                      | Management of mail server                    | 📝 **Planned**            |
| :whale: **Docker Integration**               | Container-based isolation                    | 📝 **Planned**      |
| :closed_lock_with_key: **SSL Certificates**  | Let's Encrypt SSL Certificates support       | 📝 **Planned**            |
| :jigsaw: **Module System**                   | Extensions for customization                 | ✅ **Implemented**        |
| :arrows_counterclockwise: **REST API**       | API for automate and integrate LumenOne      | 🛠️ **In development**     |


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
   git clone --branch v1.3.0-bêta https://github.com/lumenlabss/LumenOne.git
   cd LumenOne
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the `config/config.json` file:

   ```json
   {
     "hostname": "0.0.0.0",
     "port": 3000,
     "name": "LumenOne",
     "version": "v1.3.0-bêta",
     "session": {
       "secret": "secret-key",
       "resave": false,
       "saveUninitialized": false,
       "cookie": {
         "secure": false
       }
     },
     "rateLimit": {
       "global": {
         "windowMinutes": 15,
         "max": 100
       },
       "auth": {
         "windowMinutes": 15,
         "max": 5
       }
     }
   }
   ```

4. Create admin account:

   ```bash
   node create-admin.js
   ```

5. Start the server:

   ```bash
   node lumenone.js
   ```

6. Access the web interface:

   ```
   http://localhost:3000
   ```

7. Nginx Config:

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
