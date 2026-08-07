import brandConfig from '../../../../../brand.config.json';

// =============================================================================
// Constants - Domain & Server Configuration (from brand.config.json)
// =============================================================================

// Production app domains
export const PRODUCTION_DOMAINS = {
    COM: brandConfig.platform.hostname.production.com,
} as const;

// Staging app domains
export const STAGING_DOMAINS = {
    COM: brandConfig.platform.hostname.staging.com,
} as const;

// Deriv WebSocket URLs
const OAUTH_CLIENT_ID = '342vx4HbkVVPtJejdGKP1';
export const WS_SERVERS = {
    STAGING: `wss://staging-api.derivws.com/trading/v1/options/ws/public?app_id=342`,
    PRODUCTION: `wss://api.derivws.com/trading/v1/options/ws/public?app_id=342`,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

// Helper to check if we're on production domains
export const isProduction = () => {
    const hostname = window.location.hostname;
    const productionDomains = Object.values(PRODUCTION_DOMAINS) as string[];
    return productionDomains.includes(hostname);
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    const isProductionEnv = isProduction();

    try {
        return isProductionEnv ? WS_SERVERS.PRODUCTION : WS_SERVERS.STAGING;
    } catch (error) {
        console.error('Error in getDefaultServerURL:', error);
    }

    // Production defaults to demov2, staging/preview defaults to qa194 (demo)
    return isProductionEnv ? WS_SERVERS.PRODUCTION : WS_SERVERS.STAGING;
};

/**
 * Gets the WebSocket URL for Deriv API connection.
 *
 * Flow:
 * 1. Get Ory access_token from sessionStorage (from OAuth)
 * 2. Use Netlify Function proxy to call Deriv REST API (avoids CORS)
 * 3. Get accounts list, then OTP for the active account
 * 4. OTP returns an authenticated WebSocket URL
 *
 * Falls back to plain WebSocket URL if proxy fails.
 *
 * @returns WebSocket URL
 */
export const getSocketURL = async (): Promise<string> => {
    const defaultUrl = isProduction() ? WS_SERVERS.PRODUCTION : WS_SERVERS.STAGING;

    try {
        let authInfoStr = sessionStorage.getItem('auth_info');

        if (!authInfoStr && new URLSearchParams(window.location.search).has('code')) {
            console.log('[WS] OAuth callback detected, waiting for token exchange to complete...');
            for (let i = 0; i < 50; i++) {
                await new Promise(resolve => setTimeout(resolve, 200));
                authInfoStr = sessionStorage.getItem('auth_info');
                if (authInfoStr) {
                    console.log('[WS] auth_info found after waiting');
                    break;
                }
            }
        }

        if (!authInfoStr) {
            console.log('[WS] No auth_info, using default URL');
            return defaultUrl;
        }

        const authInfo = JSON.parse(authInfoStr);
        const accessToken = authInfo.access_token;
        if (!accessToken) {
            console.log('[WS] No access_token, using default URL');
            return defaultUrl;
        }

        const proxyUrl = `${window.location.origin}/api/deriv-proxy`;

        // Step 1: Get accounts list
        console.log('[WS] Fetching accounts via proxy...');
        const accountsResp = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken, action: 'accounts' }),
        });

        if (!accountsResp.ok) {
            console.warn('[WS] Accounts fetch failed:', accountsResp.status);
            return defaultUrl;
        }

        const accountsData = await accountsResp.json();
        console.log('[WS] Accounts response:', JSON.stringify(accountsData).substring(0, 300));

        const accounts = accountsData?.data;
        if (!accounts || accounts.length === 0) {
            console.warn('[WS] No accounts found');
            return defaultUrl;
        }

        // Step 2: Pick the active account
        const activeLoginId = localStorage.getItem('active_loginid');
        const targetAccount = accounts.find((a) => (a.loginid || a.account_id) === activeLoginId) || accounts[0];
        const accountId = targetAccount.loginid || targetAccount.account_id;

        console.log('[WS] Target account:', accountId);

        // Step 3: Get OTP WebSocket URL
        console.log('[WS] Fetching OTP via proxy...');
        const otpResp = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken, action: 'otp', account_id: accountId }),
        });

        if (!otpResp.ok) {
            console.warn('[WS] OTP fetch failed:', otpResp.status);
            return defaultUrl;
        }

        const otpData = await otpResp.json();
        console.log('[WS] OTP response:', JSON.stringify(otpData).substring(0, 300));

        // The OTP response contains a WebSocket URL with credentials embedded
        const wsUrl = otpData?.data?.url;
        if (wsUrl) {
            console.log('[WS] Got authenticated WebSocket URL from OTP');
            return wsUrl;
        }

        console.warn('[WS] No WebSocket URL in OTP response, using default');
        return defaultUrl;
    } catch (error) {
        console.error('[WS] Error in getSocketURL:', error);
        return defaultUrl;
    }
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};

/**
 * Generates a cryptographically secure CSRF token
 * @returns A random base64url-encoded string
 */
const generateCSRFToken = (): string => {
    // Generate 32 random bytes (256 bits) for strong security
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // Convert to base64url encoding (URL-safe)
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Generates a PKCE code verifier (random string)
 * @returns A cryptographically random base64url-encoded string (43-128 characters)
 */
const generateCodeVerifier = (): string => {
    // Generate 32 random bytes (will result in 43 characters after base64url encoding)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // Convert to base64url encoding (URL-safe, no padding)
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Generates a PKCE code challenge from a code verifier using SHA-256
 * @param verifier The code verifier string
 * @returns Promise that resolves to the base64url-encoded SHA-256 hash
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
    // Encode the verifier as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);

    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert to base64url encoding
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode(...hashArray));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Stores PKCE code verifier in sessionStorage for token exchange
 * @param verifier The code verifier to store
 */
const storeCodeVerifier = (verifier: string): void => {
    sessionStorage.setItem('oauth_code_verifier', verifier);
    // Also store timestamp for verifier expiration (e.g., 10 minutes)
    sessionStorage.setItem('oauth_code_verifier_timestamp', Date.now().toString());
};

/**
 * Retrieves and validates the stored PKCE code verifier
 * @returns The code verifier if valid and not expired, null otherwise
 */
export const getCodeVerifier = (): string | null => {
    const verifier = sessionStorage.getItem('oauth_code_verifier');
    const timestamp = sessionStorage.getItem('oauth_code_verifier_timestamp');

    if (!verifier || !timestamp) {
        return null;
    }

    // Check if verifier is expired (10 minutes = 600000ms)
    const verifierAge = Date.now() - parseInt(timestamp, 10);
    if (verifierAge > 600000) {
        // Clean up expired verifier
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_code_verifier_timestamp');
        return null;
    }

    return verifier;
};

/**
 * Clears PKCE code verifier from sessionStorage after successful token exchange
 */
export const clearCodeVerifier = (): void => {
    sessionStorage.removeItem('oauth_code_verifier');
    sessionStorage.removeItem('oauth_code_verifier_timestamp');
};

/**
 * Stores CSRF token in sessionStorage for validation after OAuth callback
 * @param token The CSRF token to store
 */
const storeCSRFToken = (token: string): void => {
    sessionStorage.setItem('oauth_csrf_token', token);
    // Also store timestamp for token expiration (e.g., 10 minutes)
    sessionStorage.setItem('oauth_csrf_token_timestamp', Date.now().toString());
};

/**
 * Validates CSRF token from OAuth callback
 * @param token The token to validate
 * @returns true if token is valid and not expired
 */
export const validateCSRFToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('oauth_csrf_token');
    const timestamp = sessionStorage.getItem('oauth_csrf_token_timestamp');

    if (!storedToken || !timestamp) {
        return false;
    }

    // Check if token matches
    if (storedToken !== token) {
        return false;
    }

    // Check if token is expired (10 minutes = 600000ms)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 600000) {
        // Clean up expired token
        sessionStorage.removeItem('oauth_csrf_token');
        sessionStorage.removeItem('oauth_csrf_token_timestamp');
        return false;
    }

    return true;
};

/**
 * Clears CSRF token from sessionStorage after successful validation
 */
export const clearCSRFToken = (): void => {
    sessionStorage.removeItem('oauth_csrf_token');
    sessionStorage.removeItem('oauth_csrf_token_timestamp');
};

export const generateOAuthURL = async (prompt?: string) => {
    try {
        // Use brand config for login URLs
        const environment = isProduction() ? 'production' : 'staging';
        const hostname = brandConfig?.platform.auth2_url?.[environment];
            const clientId = '342vx4HbkVVPtJejdGKP1';

        if (hostname && clientId) {
            // Generate CSRF token for security
            const csrfToken = generateCSRFToken();

            // Store token for validation after callback
            storeCSRFToken(csrfToken);

            // Generate PKCE parameters (required by Deriv's server)
            const codeVerifier = generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            // Store code verifier for token exchange
            storeCodeVerifier(codeVerifier);

            // Build redirect URL
            const protocol = window.location.protocol;
            const host = window.location.host;
            const redirectUrl = `${protocol}//${host}`;

            // Build OAuth URL with PKCE parameters
            let oauthUrl = `${hostname}auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${csrfToken}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

            // Optional: prompt parameter (e.g. 'registration' for signup flow)
            if (prompt) {
                oauthUrl += `&prompt=${encodeURIComponent(prompt)}`;
            }

            // Optional: legacy app_id for routing users on the Legacy Deriv API platform
            const appId = process.env.APP_ID;
            if (appId) {
                oauthUrl += `&app_id=${encodeURIComponent(appId)}`;
            }

            console.log('OAuth URL:', oauthUrl);
            return oauthUrl;
        }
    } catch (error) {
        console.error('Error generating OAuth URL:', error);
    }

    // Fallback to hardcoded URLs if brand config fails
    return ``;
};
