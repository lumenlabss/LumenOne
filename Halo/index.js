const axios = require('axios');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const NODE_NAME = process.env.NODE_NAME || 'Halo-Node-01';
const MASTER_URL = process.env.MASTER_URL || 'http://localhost:3000/api/halo/heartbeat';
const HEARTBEAT_INTERVAL = 30000;
const HALO_PORT = process.env.HALO_PORT || 4000;
const HALO_TOKEN = process.env.HALO_TOKEN || 'halo-secret-token';
const VOLUMES_DIR = path.join(__dirname, 'volumes');

// Ensure volumes directory exists
if (!fs.existsSync(VOLUMES_DIR)) {
    fs.mkdirSync(VOLUMES_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === `Bearer ${HALO_TOKEN}`) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// File Operations Endpoints
app.get('/api/files/list/:uuid', auth, (req, res) => {
    const { uuid } = req.params;
    const sitePath = path.join(VOLUMES_DIR, uuid);

    if (!fs.existsSync(sitePath)) {
        return res.status(404).json({ error: 'Site not found' });
    }

    try {
        const files = fs.readdirSync(sitePath).map(fileName => {
            const stats = fs.statSync(path.join(sitePath, fileName));
            return {
                name: fileName,
                size: (stats.size / 1024 / 1024).toFixed(2)
            };
        });
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/files/create/:uuid', auth, (req, res) => {
    const { uuid } = req.params;
    const { filename, content } = req.body;
    const filePath = path.join(VOLUMES_DIR, uuid, filename);

    if (!fs.existsSync(path.join(VOLUMES_DIR, uuid))) {
        fs.mkdirSync(path.join(VOLUMES_DIR, uuid), { recursive: true });
    }

    fs.writeFile(filePath, content || '', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/files/delete/:uuid/:filename', auth, (req, res) => {
    const { uuid, filename } = req.params;
    const filePath = path.join(VOLUMES_DIR, uuid, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/files/reset/:uuid', auth, (req, res) => {
    const { uuid } = req.params;
    const { engine } = req.body;
    const sitePath = path.join(VOLUMES_DIR, uuid);

    if (fs.existsSync(sitePath)) {
        fs.rmSync(sitePath, { recursive: true, force: true });
    }
    fs.mkdirSync(sitePath, { recursive: true });

    if (engine === 'nodejs') {
        const packageJson = { name: uuid, version: '1.0.0', main: 'index.js' };
        fs.writeFileSync(path.join(sitePath, 'package.json'), JSON.stringify(packageJson, null, 2));
        fs.writeFileSync(path.join(sitePath, 'index.js'), 'console.log("Hello from Halo NodeJS!");');
    } else {
        fs.writeFileSync(path.join(sitePath, 'index.html'), '<h1>Welcome to your new site on Halo!</h1>');
    }
    res.json({ success: true });
});

// Start Server
app.listen(HALO_PORT, () => {
    console.log(`Halo API Server running on port ${HALO_PORT}`);
});

// Heartbeat
async function sendHeartbeat() {
    try {
        await axios.post(MASTER_URL, {
            name: NODE_NAME,
            status: 'online',
            last_seen: new Date().toISOString(),
            ip: process.env.HALO_IP || 'localhost', // External IP if available
            port: HALO_PORT
        });
    } catch (error) {
        console.error('Heartbeat failed:', error.message);
    }
}

setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
sendHeartbeat();

process.on('SIGINT', () => {
    console.log('Halo Node shutting down...');
    process.exit();
});
