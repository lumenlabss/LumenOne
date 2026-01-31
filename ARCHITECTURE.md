# LumenOne Architecture

Welcome to the LumenOne architecture documentation. This guide is designed to help new developers understand how the project is structured and how to contribute.

## Project Overview

LumenOne is built using a modern **MVC (Model-View-Controller)** pattern with **Node.js** and **Express**.

## Directory Structure

```text
├── config/             # Configuration files (config.json)
├── modules/            # Optional modules/extensions
├── public/             # Static assets (client-side JS, CSS, images)
├── src/                # Backend Source Code
│   ├── api/            # Official API routes (v1)
│   ├── config/         # Config loader and environment variables
│   ├── controllers/    # Business logic (Requests handling)
│   ├── middleware/     # Express middlewares (Auth, Rate limiting, etc.)
│   ├── routes/         # Route definitions (Link URLs to Controllers)
│   ├── utils/          # Utility functions and helpers
│   ├── web/            # System utilities (Nginx config, etc.)
│   └── db.js           # Database initialization (SQLite)
├── storage/            # Data storage (Websites volumes, backups)
├── views/              # EJS Templates (UI)
└── lumenone.js         # Entry point of the application
```

## Routing & Logic Flow

LumenOne follows a clear separation of concerns:

1.  **Entry Point (`lumenone.js`)**: Initializes the Express app, applies global middlewares (Security, Sessions), and registers the main route groups.
2.  **Routes (`src/routes/`)**: Defines the endpoint URLs. Each route file is dedicated to a specific feature (e.g., `userRoutes.js`, `adminRoutes.js`) and maps URLs to controller functions.
3.  **Controllers (`src/controllers/`)**: Contains the "brain" of the application. Controllers receive the request, interact with the Database or File System, and render the appropriate View or return JSON.
4.  **Middleware (`src/middleware/`)**: Functions that run before the controller (e.g., checking if a user is logged in).

### Example: Accessing the website list

`URL: /web/list` -> `lumenone.js` -> `src/routes/userRoutes.js` -> `src/controllers/userController.js (getWebList)` -> `views/web/list.ejs`

## Data Management

- **Database**: We use **SQLite** (`lumenone.db`). The schema is defined and initialized in `src/db.js`.
- **File Storage**: User websites are stored in `storage/volumes/` using their unique UUIDs to prevent conflicts.

## Security Best Practices

- **Password Hashing**: Always use `bcrypt` to hash passwords before saving them to the database.
- **Input Validation**: Use `express-validator` (planned) or manual checks to sanitize user inputs.
- **Environment Variables**: Sensitive data should be managed via `.env` (loaded in `src/config/config.js`).

## How to Contribute

1.  **Read the Code**: Familiarize yourself with the existing controllers and routes.
2.  **Follow the Pattern**: When adding a new feature, create a new route file and a corresponding controller.
3.  **Update Documentation**: If you change the structure, update this file!
