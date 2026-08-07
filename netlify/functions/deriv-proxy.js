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
        const { access_token, action, account_id } = JSON.parse(event.body || '{}');

        if (!access_token) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing access_token' }) };
        }

        const baseUrl = 'https://api.derivws.com/trading/v1';

        if (action === 'accounts') {
            const response = await fetch(`${baseUrl}/accounts`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const data = await response.json();
            return { statusCode: response.status, headers, body: JSON.stringify(data) };
        }

        if (action === 'otp') {
            if (!account_id) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing account_id for OTP' }) };
            }
            const response = await fetch(`${baseUrl}/options/accounts/${account_id}/otp`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const data = await response.json();
            return { statusCode: response.status, headers, body: JSON.stringify(data) };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action. Use "accounts" or "otp".' }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
