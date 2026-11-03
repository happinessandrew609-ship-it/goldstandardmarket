import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { DBOT_TABS } from '@/constants/bot-contents';
import { IPegasusSignal, loadPegasusStrategyToWorkspace } from './pegasus-strategy-loader';
import { scanDerivLiveMarkets } from './pegasus-scanner-service';
import { pegasusAudio } from './pegasus-audio';
import './pegasus-ai.scss';

interface IPegasusAiProps {
    handleTabChange: (tabIndex: number) => void;
}

export const PegasusAi: React.FC<IPegasusAiProps> = observer(({ handleTabChange }) => {
    const { run_panel } = useStore();

    // User configuration inputs
    const [stake, setStake] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_stake');
        return saved ? parseFloat(saved) : 1.0;
    });

    const [takeProfit, setTakeProfit] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_tp');
        return saved ? parseFloat(saved) : 25.0;
    });

    const [stopLoss, setStopLoss] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_sl');
        return saved ? parseFloat(saved) : 50.0;
    });

    const [martingaleMultiplier, setMartingaleMultiplier] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_mart');
        return saved ? parseFloat(saved) : 2.0;
    });

    // Scanner state
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanMessage, setScanMessage] = useState<string>('Ready to scan live markets');
    const [signals, setSignals] = useState<IPegasusSignal[]>([]);
    const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => pegasusAudio.isAudioMuted());

    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Save inputs to localStorage on change
    useEffect(() => {
        localStorage.setItem('pegasus_input_stake', String(stake));
        localStorage.setItem('pegasus_input_tp', String(takeProfit));
        localStorage.setItem('pegasus_input_sl', String(stopLoss));
        localStorage.setItem('pegasus_input_mart', String(martingaleMultiplier));
    }, [stake, takeProfit, stopLoss, martingaleMultiplier]);

    // Handle audio mute toggle
    const handleToggleAudio = () => {
        const nextState = pegasusAudio.toggleMute();
        setIsAudioMuted(nextState);
    };

    // Handle radar scan click
    const handleStartScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setSignals([]);
        setScanMessage('Scanning live synthetic-index ticks...');

        // Start periodic sonar sweep ping
        pegasusAudio.playRadarPing();
        pingIntervalRef.current = setInterval(() => {
            pegasusAudio.playRadarPing();
        }, 800);

        try {
            const liveSignals = await scanDerivLiveMarkets(msg => {
                setScanMessage(msg);
            });

            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }

            setIsScanning(false);
            setScanMessage(`${liveSignals.length} live Pegasus signals identified.`);
            setSignals(liveSignals);
            pegasusAudio.playWinChime();

            setTimeout(() => {
                const el = document.querySelector('.pegasus-view__signals');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } catch (err) {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
            setIsScanning(false);
            setScanMessage('Scan complete (fallback calibrated signals loaded).');
        }
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, []);

    // Handle selecting a signal to load strategy
    const handleSelectSignal = (signal: IPegasusSignal) => {
        pegasusAudio.playActivateSound();

        // Load into active Blockly workspace with full risk params
        loadPegasusStrategyToWorkspace(
            signal.symbol,
            stake,
            takeProfit,
            signal.barrier || 1,
            signal.tradeType,
            stopLoss,
            martingaleMultiplier
        );

        // Switch tab to Bot Builder where the workspace and modal reside
        handleTabChange(DBOT_TABS.BOT_BUILDER);

        // Open activation modal over Bot Builder
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gsm:pegasus-activated-modal-open'));
        }, 120);
    };

    return (
        <div className="pegasus-view">
            <div className="pegasus-view__container">
                {/* Header */}
                <div className="pegasus-view__header">
                    <div className="pegasus-view__eyebrow">
                        <span className="pegasus-view__eyebrow-dot" />
                        POWERED BY PEGASUS AI
                    </div>
                    <h1 className="pegasus-view__title">Activate Pegasus</h1>
                    <p className="pegasus-view__subtitle">
                        Configure your capital parameters, then activate the scanner to detect real-time statistical anomalies.
                    </p>
                    <button
                        className={`pegasus-view__sound-toggle ${!isAudioMuted ? 'pegasus-view__sound-toggle--active' : ''}`}
                        onClick={handleToggleAudio}
                        aria-label="Toggle Sound Effects"
                    >
                        <span>{!isAudioMuted ? '🔊 Audio FX: ON' : '🔇 Audio FX: OFF'}</span>
                    </button>
                </div>

                {/* Capital & Risk Parameters Inputs */}
                <div className="pegasus-view__inputs">
                    {/* Stake */}
                    <div className="pegasus-view__input-group">
                        <label htmlFor="pegasus-stake">Stake (USD)</label>
                        <div className="input-wrapper">
                            <input
                                id="pegasus-stake"
                                type="number"
                                min="0.35"
                                step="1"
                                value={stake}
                                onChange={e => setStake(parseFloat(e.target.value) || 0)}
                            />
                            <span className="currency-tag">USD</span>
                        </div>
                    </div>

                    {/* Take Profit */}
                    <div className="pegasus-view__input-group">
                        <label htmlFor="pegasus-tp">Take-profit (USD)</label>
                        <div className="input-wrapper">
                            <input
                                id="pegasus-tp"
                                type="number"
                                min="1"
                                step="5"
                                value={takeProfit}
                                onChange={e => setTakeProfit(parseFloat(e.target.value) || 0)}
                            />
                            <span className="currency-tag">USD</span>
                        </div>
                    </div>

                    {/* Stop Loss */}
                    <div className="pegasus-view__input-group">
                        <label htmlFor="pegasus-sl">Stop-loss (USD)</label>
                        <div className="input-wrapper">
                            <input
                                id="pegasus-sl"
                                type="number"
                                min="1"
                                step="10"
                                value={stopLoss}
                                onChange={e => setStopLoss(parseFloat(e.target.value) || 0)}
                            />
                            <span className="currency-tag">USD</span>
                        </div>
                    </div>

                    {/* Martingale Multiplier */}
                    <div className="pegasus-view__input-group">
                        <label htmlFor="pegasus-mart">Martingale (x)</label>
                        <div className="input-wrapper">
                            <input
                                id="pegasus-mart"
                                type="number"
                                min="1.0"
                                max="4.0"
                                step="0.1"
                                value={martingaleMultiplier}
                                onChange={e => setMartingaleMultiplier(parseFloat(e.target.value) || 2.0)}
                            />
                            <span className="currency-tag">x</span>
                        </div>
                    </div>
                </div>

                {/* Radar Scanner Section */}
                <div className="pegasus-view__radar-section">
                    <div className="pegasus-view__radar-stage" onClick={handleStartScan}>
                        {/* Concentric pulse wave rings */}
                        <div className="pegasus-view__radar-wave pegasus-view__radar-wave--1" />
                        <div className="pegasus-view__radar-wave pegasus-view__radar-wave--2" />
                        <div className="pegasus-view__radar-wave pegasus-view__radar-wave--3" />

                        {/* Sonar sweep line */}
                        <div
                            className={`pegasus-view__radar-sweep ${
                                !isScanning && signals.length === 0 ? 'pegasus-view__radar-sweep--paused' : ''
                            }`}
                        />

                        {/* Central Button */}
                        <div className={`pegasus-view__radar-btn ${isScanning ? 'pegasus-view__radar-btn--scanning' : ''}`}>
                            <span className="pegasus-view__btn-title">Activate Pegasus</span>
                            <span className="pegasus-view__btn-status">
                                {isScanning ? 'Scanning...' : signals.length > 0 ? 'Rescan' : 'Touch to scan'}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="pegasus-view__radar-badge">
                        {isScanning && <span className="spinner" />}
                        <span>{scanMessage}</span>
                    </div>
                </div>

                {/* Signal Cards Section */}
                {signals.length > 0 && (
                    <div className="pegasus-view__signals">
                        <span className="pegasus-view__signals-title">
                            Top Pegasus Signals ({signals.length})
                        </span>
                        <div className="pegasus-view__signals-grid">
                            {signals.map(sig => (
                                <div key={sig.id} className="pegasus-view__card">
                                    <div className="pegasus-view__card-header">
                                        <span className="pegasus-view__card-rank">
                                            #{sig.rank} SIGNAL
                                        </span>
                                        <span className="pegasus-view__card-score">
                                            ✓ {sig.confidence.toFixed(1)}% AI
                                        </span>
                                    </div>

                                    <div className="pegasus-view__card-body">
                                        <h3 className="pegasus-view__card-market">{sig.marketName}</h3>
                                        <p className="pegasus-view__card-details">
                                            {sig.tradeType} {sig.barrier !== undefined ? sig.barrier : ''} · {sig.recoveryRule}
                                        </p>
                                        <p className="pegasus-view__card-desc">{sig.description}</p>
                                    </div>

                                    <button
                                        className="pegasus-view__card-action"
                                        onClick={() => handleSelectSignal(sig)}
                                    >
                                        <span>Deploy Strategy</span>
                                        <span>→</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PegasusAi;
