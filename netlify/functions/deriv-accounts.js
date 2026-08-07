exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { access_token } = JSON.parse(event.body || '{}');

        if (!access_token) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing access_token' }) };
        }

        // Try the accounts endpoint
        const response = await fetch('https://api.derivws.com/trading/v1/accounts', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const data = await response.json();
        
        // Also try to get tokens if accounts work
        if (data.data && data.data.length > 0) {
            // Try to create/read tokens for each account
            const account = data.data[0];
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    accounts: data.data,
                    loginid: account.loginid || account.account_id,
                }),
            };
        }

        return { statusCode: response.status, headers, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
