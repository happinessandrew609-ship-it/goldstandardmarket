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
        const { access_token, endpoint, method, body } = JSON.parse(event.body || '{}');

        if (!access_token) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing access_token' }) };
        }

        if (!endpoint) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing endpoint' }) };
        }

        const fetchOptions = {
            method: method || 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        };

        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`https://api.derivws.com/trading/v1/${endpoint}`, fetchOptions);
        const data = await response.json();

        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
