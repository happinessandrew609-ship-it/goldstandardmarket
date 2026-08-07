const https = require('https');

function httpsGet(url, token) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { Authorization: 'Bearer ' + token } }, (res) => {
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
    });
}

function httpsPost(url, token) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = https.request({
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
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

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { access_token, action, account_id } = body;

        if (!access_token) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing access_token' }) };
        }

        if (action === 'accounts') {
            const result = await httpsGet('https://api.derivws.com/trading/v1/accounts', access_token);
            return { statusCode: result.status, headers, body: JSON.stringify(result.data) };
        }

        if (action === 'otp') {
            if (!account_id) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing account_id' }) };
            }
            const result = await httpsPost('https://api.derivws.com/trading/v1/options/accounts/' + account_id + '/otp', access_token);
            return { statusCode: result.status, headers, body: JSON.stringify(result.data) };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || String(error) }) };
    }
};
