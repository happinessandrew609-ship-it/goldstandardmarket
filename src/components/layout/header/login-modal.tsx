import React, { useState, useCallback, useEffect } from 'react';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';
import { generateOAuthURL } from '@/components/shared';
import './login-modal.scss';

export interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (account: { loginid: string; balance?: number; currency?: string }) => void;
}

export const GSM_SAVED_TOKEN = 'pat_6c4cdc1d5e24c016ac2f202d21e5c61c7305b4d2979f0f61315ac27834ebabf3';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'token' | 'oauth'>('token');
    const [token, setToken] = useState<string>('');
    const [showToken, setShowToken] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            // Check if there is an existing token in localStorage or use default
            const existingToken = localStorage.getItem('authToken');
            if (existingToken) {
                setToken(existingToken);
            } else {
                setToken('');
            }
            setErrorMessage(null);
            setSuccessMessage(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleQuickFill = useCallback(() => {
        setToken(GSM_SAVED_TOKEN);
        setErrorMessage(null);
    }, []);

    const handleTokenSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = token.trim();
        if (!trimmed) {
            setErrorMessage('Please enter your Deriv API Personal Access Token (PAT).');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const result = await api_base.authorizeWithToken(trimmed);
            if (!result.success) {
                setErrorMessage(result.error || 'Failed to authenticate with Deriv. Please check your token permissions.');
                setIsLoading(false);
                return;
            }

            setSuccessMessage(`Connected successfully! Welcome ${result.loginid || 'Trader'}.`);
            setIsLoading(false);

            if (onSuccess) {
                onSuccess({
                    loginid: result.loginid || '',
                    balance: result.balance,
                    currency: result.currency,
                });
            }

            setTimeout(() => {
                onClose();
            }, 900);
        } catch (err: any) {
            console.error('[LoginModal] Authentication error:', err);
            setErrorMessage(err?.message || 'Unexpected connection error while authenticating.');
            setIsLoading(false);
        }
    }, [token, onSuccess, onClose]);

    const handleOAuthRedirect = useCallback(async (isSignup = false) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const url = await generateOAuthURL(isSignup ? 'registration' : undefined);
            if (url) {
                window.location.replace(url);
            } else {
                setErrorMessage('Unable to generate Deriv OAuth URL. Please use API Token login.');
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error('[LoginModal] OAuth redirect failed:', err);
            setErrorMessage('Deriv OAuth redirect failed. Please try Token login.');
            setIsLoading(false);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div className="gsm-login-overlay" onClick={onClose}>
            <div className="gsm-login-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="gsm-login-header">
                    <div className="gsm-login-header__brand">
                        <div className="gsm-login-header__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L2 7L12 12L22 7L12 2Z"
                                    stroke="#D4AF37"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 17L12 22L22 17"
                                    stroke="#D4AF37"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 12L12 17L22 12"
                                    stroke="#D4AF37"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="gsm-login-header__title">Deriv Account Connect</h3>
                            <p className="gsm-login-header__subtitle">Gold Standard Market Trading Terminal</p>
                        </div>
                    </div>
                    <button className="gsm-login-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="gsm-login-tabs">
                    <button
                        className={`gsm-login-tab ${activeTab === 'token' ? 'gsm-login-tab--active' : ''}`}
                        onClick={() => setActiveTab('token')}
                        type="button"
                    >
                        <span className="gsm-login-tab__indicator"></span>
                        API Token / PAT
                    </button>
                    <button
                        className={`gsm-login-tab ${activeTab === 'oauth' ? 'gsm-login-tab--active' : ''}`}
                        onClick={() => setActiveTab('oauth')}
                        type="button"
                    >
                        Deriv OAuth Portal
                    </button>
                </div>

                {/* Status Messages */}
                {errorMessage && (
                    <div className="gsm-login-alert gsm-login-alert--error">
                        <span className="gsm-login-alert__icon">⚠</span>
                        <div className="gsm-login-alert__text">{errorMessage}</div>
                    </div>
                )}

                {successMessage && (
                    <div className="gsm-login-alert gsm-login-alert--success">
                        <span className="gsm-login-alert__icon">✓</span>
                        <div className="gsm-login-alert__text">{successMessage}</div>
                    </div>
                )}

                {/* Body Content */}
                {activeTab === 'token' ? (
                    <form className="gsm-login-form" onSubmit={handleTokenSubmit}>
                        <div className="gsm-login-field">
                            <div className="gsm-login-field__label-row">
                                <label className="gsm-login-field__label">Deriv Personal Access Token</label>
                                <button
                                    type="button"
                                    className="gsm-login-field__quickfill"
                                    onClick={handleQuickFill}
                                    title="Pre-fill provided credentials"
                                >
                                    ⚡ Quick-Fill Token
                                </button>
                            </div>
                            <div className="gsm-login-input-wrapper">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    className="gsm-login-input"
                                    placeholder="e.g. pat_6c4cdc1d5e24c016ac2f202d21..."
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    autoComplete="off"
                                    spellCheck={false}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="gsm-login-input__toggle"
                                    onClick={() => setShowToken(!showToken)}
                                    tabIndex={-1}
                                >
                                    {showToken ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <span className="gsm-login-field__hint">
                                Supports Personal Access Tokens (<code className="gsm-code">pat_...</code>) or classic API tokens with <strong>Read</strong> and <strong>Trade</strong> scopes.
                            </span>
                        </div>

                        {/* Collapsible Token Instructions */}
                        <div className="gsm-login-guide">
                            <button
                                type="button"
                                className="gsm-login-guide__toggle"
                                onClick={() => setShowHelpGuide(!showHelpGuide)}
                            >
                                <span>{showHelpGuide ? '▼' : '▶'} How to get your Deriv Token</span>
                                <span className="gsm-login-guide__badge">30 seconds</span>
                            </button>
                            {showHelpGuide && (
                                <div className="gsm-login-guide__content">
                                    <ol>
                                        <li>Log in to your Deriv account at <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer">app.deriv.com/account/api-token</a></li>
                                        <li>Go to <strong>Account Settings</strong> → <strong>API Token</strong></li>
                                        <li>Select token scopes: check <strong>Read</strong> and <strong>Trade</strong> (and <strong>Payments</strong> if you want cashier transfers)</li>
                                        <li>Click <strong>Create</strong> and copy your token</li>
                                        <li>Paste your token in the field above and click Connect</li>
                                    </ol>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="gsm-login-actions">
                            <button
                                type="submit"
                                className="gsm-login-btn gsm-login-btn--primary"
                                disabled={isLoading || !token.trim()}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="gsm-spinner"></span>
                                        Connecting to Deriv WebSocket...
                                    </>
                                ) : (
                                    'Connect Account'
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="gsm-login-oauth-section">
                        <p className="gsm-login-oauth-desc">
                            Authenticate directly through Deriv's official OAuth 2.0 authorization server.
                            You will be redirected to Deriv to sign in and grant trade access to Gold Standard Market.
                        </p>

                        <button
                            type="button"
                            className="gsm-login-btn gsm-login-btn--primary gsm-login-btn--oauth"
                            onClick={() => handleOAuthRedirect(false)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="gsm-spinner"></span>
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                                    </svg>
                                    Continue with Deriv OAuth
                                </>
                            )}
                        </button>

                        <div className="gsm-login-divider">
                            <span>or</span>
                        </div>

                        <button
                            type="button"
                            className="gsm-login-btn gsm-login-btn--secondary"
                            onClick={() => handleOAuthRedirect(true)}
                            disabled={isLoading}
                        >
                            Create a New Deriv Account
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="gsm-login-footer">
                    <div className="gsm-login-security">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>Encrypted 256-bit client-side WebSocket authorization. Tokens remain stored locally in your browser.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
