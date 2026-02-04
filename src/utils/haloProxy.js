const axios = require('axios');

const HALO_TOKEN = process.env.HALO_TOKEN || 'halo-secret-token';

class HaloProxy {
    constructor(nodeIp, nodePort) {
        this.baseUrl = `http://${nodeIp}:${nodePort}/api`;
        this.headers = {
            'Authorization': `Bearer ${HALO_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    async listFiles(siteUuid) {
        try {
            const response = await axios.get(`${this.baseUrl}/files/list/${siteUuid}`, { headers: this.headers });
            return response.data.files;
        } catch (error) {
            console.error(`HaloProxy listFiles error for ${siteUuid}:`, error.message);
            throw error;
        }
    }

    async createFile(siteUuid, filename, content = '') {
        try {
            const response = await axios.post(`${this.baseUrl}/files/create/${siteUuid}`, { filename, content }, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`HaloProxy createFile error for ${siteUuid}:`, error.message);
            throw error;
        }
    }

    async deleteFile(siteUuid, filename) {
        try {
            const response = await axios.delete(`${this.baseUrl}/files/delete/${siteUuid}/${filename}`, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`HaloProxy deleteFile error for ${siteUuid}:`, error.message);
            throw error;
        }
    }

    async resetSite(siteUuid, engine = 'php') {
        try {
            const response = await axios.post(`${this.baseUrl}/files/reset/${siteUuid}`, { engine }, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`HaloProxy resetSite error for ${siteUuid}:`, error.message);
            throw error;
        }
    }
}

module.exports = HaloProxy;
