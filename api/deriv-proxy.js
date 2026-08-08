const https = require('https');

function httpsRequest(url, options) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = https.request({
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: { raw: data } });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
        req.end();
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { access_token, action, account_id } = req.body;

        if (!access_token) {
            return res.status(400).json({ error: 'Missing access_token' });
        }

        const baseHeaders = {
            Authorization: 'Bearer ' + access_token,
            'Deriv-App-ID': '342',
        };

        if (action === 'accounts') {
            const result = await httpsRequest('https://api.derivws.com/trading/v1/options/accounts', {
                method: 'GET',
                headers: baseHeaders,
            });
            return res.status(result.status).json(result.data);
        }

        if (action === 'otp') {
            if (!account_id) {
                return res.status(400).json({ error: 'Missing account_id' });
            }
            const result = await httpsRequest('https://api.derivws.com/trading/v1/options/accounts/' + encodeURIComponent(account_id) + '/otp', {
                method: 'POST',
                headers: baseHeaders,
            });
            return res.status(result.status).json(result.data);
        }

        return res.status(400).json({ error: 'Unknown action' });
    } catch (error) {
        return res.status(500).json({ error: error.message || String(error) });
    }
};
