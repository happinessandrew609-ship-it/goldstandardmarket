import React, { useEffect, useRef, useState } from 'react';

type TTokenData = {
    loginid?: string;
    currency?: string;
    balance?: number;
    authorized?: boolean;
    loading?: boolean;
    error?: string;
};

type TTradeLog = {
    token: string;
    loginid?: string;
    contract_id?: number;
    success: boolean;
    error?: string;
};

const STORAGE_KEYS = {
    TOKENS: 'copycat_tokens',
    COPY_ACTIVE: 'copycat_copy_active',
    DEMO_ACTIVE: 'copycat_demo_active',
};

const Spinner = () => (
    <svg
        style={{ animation: 'spin 1s linear infinite', display: 'inline-block', verticalAlign: 'middle' }}
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
    >
        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25' />
        <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
    </svg>
);

export const CopyTrading: React.FC = () => {
    const [tokens, setTokens] = useState<string[]>([]);
    const [tokenMap, setTokenMap] = useState<Record<string, TTokenData>>({});
    const [inputToken, setInputToken] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string>('');
    const [isToastError, setIsToastError] = useState<boolean>(false);
    const [infoMessage, setInfoMessage] = useState<string>('');
    const [isCopyActive, setIsCopyActive] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.COPY_ACTIVE) === 'true');
    const [isDemoActive, setIsDemoActive] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.DEMO_ACTIVE) === 'true');
    const [tradeLogs, setTradeLogs] = useState<TTradeLog[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isStarting, setIsStarting] = useState<boolean>(false);
    const authTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (msg: string, isErr = false) => {
        setToastMessage(msg);
        setIsToastError(isErr);
        setTimeout(() => setToastMessage(''), 5000);
    };

    const showInfo = (msg: string) => {
        setInfoMessage(msg);
        setTimeout(() => setInfoMessage(''), 8000);
    };

    // Load saved tokens
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOKENS) || '[]');
            if (Array.isArray(saved) && saved.length > 0) {
                setTokens(saved);
                authorizeTokens(saved);
            }
        } catch {
            // ignore
        }
    }, []);

    const saveTokens = (newTokens: string[]) => {
        setTokens(newTokens);
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
    };

    const authorizeTokens = async (tokenList: string[]) => {
        for (const token of tokenList) {
            setTokenMap(prev => ({
                ...prev,
                [token]: { ...prev[token], loading: true, authorized: false, error: undefined },
            }));

            try {
                const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=111834');
                await new Promise<void>((resolve, reject) => {
                    if (ws.readyState === WebSocket.OPEN) return resolve();
                    ws.onopen = () => resolve();
                    ws.onerror = () => reject(new Error('Connection failed'));
                    setTimeout(() => reject(new Error('Connection timeout')), 10000);
                });

                const authPromise = new Promise<{ authorize?: any; error?: any }>((resolve) => {
                    const handler = (evt: MessageEvent) => {
                        const data = JSON.parse(evt.data);
                        if (data.msg_type === 'authorize' || data.error) {
                            ws.removeEventListener('message', handler);
                            resolve(data);
                        }
                    };
                    ws.addEventListener('message', handler);
                    ws.send(JSON.stringify({ authorize: token }));
                });

                const authRes = await authPromise;
                if (authRes.error) {
                    throw new Error(authRes.error.message || 'Authorization failed');
                }

                const loginid = authRes.authorize?.loginid;
                let balance = authRes.authorize?.balance;
                let currency = authRes.authorize?.currency;

                // Query balance explicitly
                try {
                    const balPromise = new Promise<{ balance?: any }>((resolve) => {
                        const handler = (evt: MessageEvent) => {
                            const data = JSON.parse(evt.data);
                            if (data.msg_type === 'balance') {
                                ws.removeEventListener('message', handler);
                                resolve(data);
                            }
                        };
                        ws.addEventListener('message', handler);
                        ws.send(JSON.stringify({ balance: 1 }));
                    });
                    const balRes = await balPromise;
                    if (balRes.balance) {
                        balance = balRes.balance.balance;
                        currency = balRes.balance.currency || currency;
                    }
                } catch {
                    // ignore
                }

                ws.close();

                setTokenMap(prev => ({
                    ...prev,
                    [token]: {
                        loginid,
                        currency,
                        balance: typeof balance === 'number' ? balance : parseFloat(balance || '0'),
                        authorized: true,
                        loading: false,
                    },
                }));
            } catch (err: any) {
                setTokenMap(prev => ({
                    ...prev,
                    [token]: {
                        ...prev[token],
                        authorized: false,
                        loading: false,
                        error: err?.message || 'Auth error',
                    },
                }));
            }
        }
    };

    const handleAddToken = () => {
        const trimmed = inputToken.trim();
        if (!trimmed) return;
        if (tokens.includes(trimmed)) {
            showToast('Token already in list.', true);
            return;
        }
        const updated = [trimmed, ...tokens];
        saveTokens(updated);
        setInputToken('');
        authorizeTokens([trimmed]);
    };

    const handleRemoveToken = (tokenToRemove: string) => {
        const updated = tokens.filter(t => t !== tokenToRemove);
        saveTokens(updated);
        setTokenMap(prev => {
            const next = { ...prev };
            delete next[tokenToRemove];
            return next;
        });
    };

    const toggleCopyTrading = async () => {
        if (isCopyActive) {
            setIsCopyActive(false);
            localStorage.setItem(STORAGE_KEYS.COPY_ACTIVE, 'false');
            showInfo('Copy trading stopped.');
        } else {
            const validTokens = tokens.filter(t => tokenMap[t]?.authorized);
            if (validTokens.length === 0) {
                showToast('Add at least one authorized client API token before starting copy trading.', true);
                return;
            }
            setIsStarting(true);
            setTimeout(() => {
                setIsStarting(false);
                setIsCopyActive(true);
                localStorage.setItem(STORAGE_KEYS.COPY_ACTIVE, 'true');
                showInfo(`✓ Copy trading LIVE — mirroring to ${validTokens.length} account(s).`);
            }, 800);
        }
    };

    const toggleDemoReal = () => {
        const next = !isDemoActive;
        setIsDemoActive(next);
        localStorage.setItem(STORAGE_KEYS.DEMO_ACTIVE, next ? 'true' : 'false');
        showInfo(next ? '✓ Demo → Real copy trading enabled.' : 'Demo → Real copy trading stopped.');
    };

    return (
        <div className='copycat-page'>
            <div className='copycat-page__hero'>
                <div className='copycat-page__hero-content'>
                    <div className='copycat-page__hero-text'>
                        <div className='copycat-page__hero-eyebrow'>⚡ Live Copy Trading</div>
                        <h1 className='copycat-page__hero-headline'>
                            Your account, your control.
                            <br />
                            Maximize Gains with <span>CopyTrading</span>
                        </h1>
                        <p className='copycat-page__hero-sub'>
                            Mirror winning strategies in real time across multiple Deriv accounts simultaneously.
                        </p>
                    </div>

                    <div className='copycat-page__hero-actions'>
                        <button className='copycat-page__btn-tutorial' onClick={() => setIsModalOpen(true)}>
                            ▶ Watch Tutorial
                        </button>

                        <button
                            className={`copycat-page__btn-primary ${isCopyActive ? 'active' : ''}`}
                            onClick={toggleCopyTrading}
                            disabled={isStarting}
                        >
                            {isStarting ? <Spinner /> : isCopyActive ? '■ Stop Mirroring' : '▶ Start Copy Trading'}
                        </button>

                        <button
                            className={`copycat-page__btn-demo ${isDemoActive ? 'active' : ''}`}
                            onClick={toggleDemoReal}
                        >
                            {isDemoActive ? '✓ Demo → Real Active' : 'Enable Demo → Real'}
                        </button>
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className={`copycat-page__toast ${isToastError ? 'error' : 'success'}`}>{toastMessage}</div>
            )}
            {infoMessage && <div className='copycat-page__toast info'>{infoMessage}</div>}

            <div className='copycat-page__body'>
                <div className='copycat-page__panel'>
                    <div className='copycat-page__card'>
                        <div className='copycat-page__card-header'>
                            <div className='copycat-page__card-icon'>🔑</div>
                            <h3 className='copycat-page__card-title'>Connected Client Accounts</h3>
                            <span className='copycat-page__card-count'>{tokens.length}</span>
                        </div>

                        <div className='copycat-page__add-token'>
                            <input
                                type='text'
                                className='copycat-page__input'
                                placeholder='Enter client Deriv API token'
                                value={inputToken}
                                onChange={e => setInputToken(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddToken()}
                            />
                            <button className='copycat-page__btn-add' onClick={handleAddToken}>
                                + Add Account
                            </button>
                        </div>

                        <ul className='copycat-page__token-list'>
                            {tokens.length === 0 ? (
                                <li className='copycat-page__empty-state'>
                                    No accounts connected yet. Add an API token above to begin mirroring.
                                </li>
                            ) : (
                                tokens.map((tok, idx) => {
                                    const meta = tokenMap[tok];
                                    return (
                                        <li key={tok} className='copycat-page__token-item'>
                                            <span className='copycat-page__token-index'>{idx + 1}</span>
                                            <span className='copycat-page__token-value' title={tok}>
                                                {tok.slice(0, 8)}…{tok.slice(-4)}
                                            </span>
                                            <span className='copycat-page__token-meta'>
                                                {meta?.authorized ? (
                                                    <React.Fragment>
                                                        <span className='copycat-page__badge success'>✓</span>
                                                        {meta.loginid && <span>{meta.loginid}</span>}
                                                        {meta.currency && meta.balance !== undefined && (
                                                            <span style={{ color: '#10b981', fontWeight: 600 }}>
                                                                {meta.balance.toFixed(2)} {meta.currency}
                                                            </span>
                                                        )}
                                                    </React.Fragment>
                                                ) : meta?.error ? (
                                                    <React.Fragment>
                                                        <span className='copycat-page__badge error'>Failed</span>
                                                        <button
                                                            className='copycat-page__retry-btn'
                                                            onClick={() => authorizeTokens([tok])}
                                                            disabled={meta.loading}
                                                        >
                                                            {meta.loading ? <Spinner /> : 'Retry'}
                                                        </button>
                                                    </React.Fragment>
                                                ) : (
                                                    <span className='copycat-page__authorizing'>
                                                        <Spinner /> Authorizing…
                                                    </span>
                                                )}
                                            </span>
                                            <button
                                                className='copycat-page__remove-btn'
                                                onClick={() => handleRemoveToken(tok)}
                                                title='Remove'
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {tradeLogs.length > 0 && (
                <div className='copycat-page__body' style={{ marginTop: 0 }}>
                    <div className='copycat-page__panel' style={{ gridColumn: '1 / -1' }}>
                        <div className='copycat-page__card'>
                            <div className='copycat-page__card-header'>
                                <div className='copycat-page__card-icon'>📋</div>
                                <h3 className='copycat-page__card-title'>Replication Log</h3>
                                <span className='copycat-page__card-count'>{tradeLogs.length}</span>
                            </div>
                            <ul className='copycat-page__token-list'>
                                {tradeLogs.map((log, idx) => (
                                    <li key={idx} className='copycat-page__token-item'>
                                        <span className={`copycat-page__badge ${log.success ? 'success' : 'error'}`}>
                                            {log.success ? '✓' : '✗'}
                                        </span>
                                        <span className='copycat-page__token-meta'>
                                            <strong>{log.loginid ?? log.token.slice(0, 8)}</strong>
                                            {log.success ? (
                                                <span style={{ color: '#10b981', marginLeft: 8 }}>
                                                    Contract #{log.contract_id}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#ef4444', marginLeft: 8 }}>{log.error}</span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className='copycat-page__modal-overlay' onClick={() => setIsModalOpen(false)}>
                    <div className='copycat-page__modal' onClick={e => e.stopPropagation()}>
                        <button className='copycat-page__modal-close' onClick={() => setIsModalOpen(false)}>
                            ✕
                        </button>
                        <h2>CopyTrading Tutorial</h2>
                        <iframe
                            width='100%'
                            height='100%'
                            src='https://www.youtube.com/embed/gsWzKmslEnY'
                            title='CopyTrading Tutorial'
                            frameBorder='0'
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CopyTrading;
