import { lazy, Suspense, useState } from 'react';
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import LocalStorageSyncWrapper from '@/components/localStorage-sync-wrapper';
import RoutePromptDialog from '@/components/route-prompt-dialog';
import { useAccountSwitching } from '@/hooks/useAccountSwitching';
import { useLanguageFromURL } from '@/hooks/useLanguageFromURL';
import { StoreProvider } from '@/hooks/useStore';
import { clearDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { validateCSRFToken, clearCSRFToken } from '@/components/shared/utils/config/config';
import { OAuthTokenExchangeService } from '@/services/oauth-token-exchange.service';
import { initializeI18n, localize, TranslationProvider } from '@deriv-com/translations';
import CoreStoreProvider from './CoreStoreProvider';
import './app-root.scss';

const Layout = lazy(() => import('../components/layout'));
const AppRoot = lazy(() => import('./app-root'));

// Translations CDN is optional — requires TRANSLATIONS_CDN_URL, R2_PROJECT_NAME, and CROWDIN_BRANCH_NAME env vars.
// Without these, the app defaults to English. See user-guide/03-white-labeling.md#translations for setup instructions.
const i18nInstance = initializeI18n({ cdnUrl: '' });

/**
 * Component wrapper to handle language URL parameter
 * Uses the useLanguageFromURL hook to process language switching
 */
const LanguageHandler = ({ children }: { children: React.ReactNode }) => {
    useLanguageFromURL();
    return <>{children}</>;
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={
                <Suspense
                    fallback={<ChunkLoader message={localize('Please wait while we connect to the server...')} />}
                >
                    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
                        <LanguageHandler>
                            <StoreProvider>
                                <LocalStorageSyncWrapper>
                                    <RoutePromptDialog />
                                    <CoreStoreProvider>
                                        <Layout />
                                    </CoreStoreProvider>
                                </LocalStorageSyncWrapper>
                            </StoreProvider>
                        </LanguageHandler>
                    </TranslationProvider>
                </Suspense>
            }
        >
            {/* All child routes will be passed as children to Layout */}
            <Route index element={<AppRoot />} />
        </Route>
    )
);

/**
 * Handles old Deriv OAuth callback (token1/acct1 in URL params)
 * Returns true if old flow was handled
 */
function handleOldOAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const token1 = urlParams.get('token1');
    const acct1 = urlParams.get('acct1');
    const cur1 = urlParams.get('cur1');

    if (!token1) return false;

    console.log('[Auth] Old OAuth callback detected');

    // Store token1 as authToken for bot-skeleton
    localStorage.setItem('authToken', token1);

    // Store account ID
    if (acct1) {
        localStorage.setItem('active_loginid', acct1);
        const isDemo = acct1.startsWith('VRT') || acct1.startsWith('VRTC');
        localStorage.setItem('account_type', isDemo ? 'demo' : 'real');
    }

    // Store accountsList format for bot-skeleton compatibility
    if (acct1 && token1) {
        const accountsList: Record<string, string> = {};
        accountsList[acct1] = token1;
        localStorage.setItem('accountsList', JSON.stringify(accountsList));
    }

    // Store currency if available
    if (cur1 && acct1) {
        const clientAccounts = JSON.parse(localStorage.getItem('client_account_details') || '[]');
        const existingIdx = clientAccounts.findIndex((a: any) => a.loginid === acct1);
        const accountData = {
            balance: 0,
            currency: cur1.toUpperCase(),
            is_virtual: acct1.startsWith('VRT') || acct1.startsWith('VRTC') ? 1 : 0,
            loginid: acct1,
        };
        if (existingIdx >= 0) {
            clientAccounts[existingIdx] = { ...clientAccounts[existingIdx], ...accountData };
        } else {
            clientAccounts.push(accountData);
        }
        localStorage.setItem('client_account_details', JSON.stringify(clientAccounts));
    }

    // Clean URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('token1');
    url.searchParams.delete('acct1');
    url.searchParams.delete('token2');
    url.searchParams.delete('acct2');
    url.searchParams.delete('cur1');
    url.searchParams.delete('cur2');
    url.searchParams.delete('state');
    window.history.replaceState({}, '', url.toString());

    console.log('[Auth] Old OAuth: token1 stored');
    clearDerivApiInstance();

    return true;
}

/**
 * Handles PKCE OAuth2 callback (code + state in URL params)
 * Returns a promise that resolves to true if PKCE flow was handled
 */
async function handlePKCECallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    // Not a PKCE callback
    if (!code && !error && !state) return false;

    // Handle error response
    if (error) {
        console.error('[Auth] PKCE OAuth error:', error, errorDescription);
        // Clean URL and return
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.toString());
        return true;
    }

    // Validate state (CSRF token)
    if (!state) {
        console.error('[Auth] PKCE callback missing state parameter');
        return true;
    }

    if (!validateCSRFToken(state)) {
        console.error('[Auth] PKCE callback CSRF validation failed');
        clearCSRFToken();
        return true;
    }

    // CSRF validation passed - exchange code for token
    clearCSRFToken();

    if (!code) {
        console.error('[Auth] PKCE callback missing authorization code');
        return true;
    }

    console.log('[Auth] PKCE callback detected, exchanging code for token...');

    try {
        const result = await OAuthTokenExchangeService.exchangeCodeForToken(code);

        if (result.error) {
            console.error('[Auth] Token exchange failed:', result.error, result.error_description);
            return true;
        }

        console.log('[Auth] Token exchange successful');

        // Clean URL params
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.delete('scope');
        window.history.replaceState({}, '', url.toString());

        // Clear old API instance to force reconnection with new token
        clearDerivApiInstance();

        return true;
    } catch (err) {
        console.error('[Auth] Token exchange error:', err);
        return true;
    }
}

/**
 * Main App component
 *
 * Responsibilities:
 * 1. OAuth callback handling (old flow: token1/acct1 + PKCE: code/state)
 * 2. Account switching from URL (via useAccountSwitching hook)
 * 3. Router provider setup
 */
function App() {
    // Check for any OAuth callback params (old flow or PKCE)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOldOAuthParams = urlParams.has('token1');
    const hasPKCEParams = urlParams.has('code') || urlParams.has('error');
    const hasOAuthCallback = hasOldOAuthParams || hasPKCEParams;
    const [authReady, setAuthReady] = useState(!hasOAuthCallback);

    // Handle account switching via URL parameter
    useAccountSwitching();

    // Process OAuth callback on mount
    React.useEffect(() => {
        if (hasOldOAuthParams) {
            const handled = handleOldOAuthCallback();
            setAuthReady(true);
        } else if (hasPKCEParams) {
            handlePKCECallback().then(() => {
                setAuthReady(true);
            });
        }
    }, [hasOldOAuthParams, hasPKCEParams]);

    if (!authReady) {
        return (
            <Suspense fallback={<ChunkLoader message='Authenticating...' />}>
                <ChunkLoader message='Authenticating...' />
            </Suspense>
        );
    }

    return <RouterProvider router={router} />;
}

export default App;
