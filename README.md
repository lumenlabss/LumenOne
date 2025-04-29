![image](https://github.com/user-attachments/assets/5222bd49-29c6-4346-8a37-296a2ecb6e8c)

# LumenOne Pre-Alpha

| :exclamation: **LumenOne is under development**: some features may be unstable or incomplete. Its use in a production environment is strongly discouraged at this time. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**LumenOne** is a free and open-source alternative to Plesk, designed to simplify web hosting management (websites, domains, databases, FTP, emails, etc.) through a modern, intuitive, and lightweight interface. Developed in **Node.js**, LumenOne aims to provide a performant and extensible solution for developers and system administrators.

---

## :sparkles: Key Features

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

## :white_check_mark: ToDo List

Project completion: ⁓ 20%

### Core

- [x] User authentication (login, logout, sessions)
- [x] Role system (admin, user)
- [ ] Dashboard for service management (web, FTP, databases)
- [ ] User/action logs system (audit)
- [ ] devloppement and production mode (production = no logs)

### Web

- [x] Welcome interface with service summary
- [x] Domain and subdomain management
- [x] Integrated file manager (upload, delete, edit)
- [ ] Interface for database management (create, delete, access)

### Backend

- [ ] REST API (users, domains, files, databases)
- [ ] Security (rate limiting, JWT token management, CSRF protection)
- [ ] Multi-server support for scalability
- [x] Size limit system (normally works)
- [x] Code reorganization into modules (`src`)
- [ ] Create a Middlewares files (`src/middlewares/exemple.js`)

### Modules

- [ ] Let's Encrypt SSL certificates (automatic generation and renewal)
- [ ] Integrated webmail (Rainloop, Roundcube)
- [ ] Application installation (WordPress, Joomla, etc.)
- [ ] Resource monitoring (CPU, RAM, storage)

### Bonus

- [ ] Complete documentation (installation, API, development)
- [ ] Mobile-friendly interface
- [ ] Multiple theme (Light theme, Plesk theme, and other)
- [ ] Notification system (emails, alerts)
- [ ] Language system
- [ ] Docker integration (optional for service isolation)
- [x] Add `console.log("exemple.js loaded");` for all backend files

---

## :speech_balloon: Community

Join the LumenOne community to ask questions, report bugs, or propose ideas:

- [GitHub Issues](https://github.com/your-username/RubixOne/issues)
- [Discord](https://discord.gg/ty92ffCYUC)

---

## :tada: Acknowledgments

Thanks to all contributors and users who support the LumenOne project!
