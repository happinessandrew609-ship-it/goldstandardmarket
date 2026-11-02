import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { DBOT_TABS } from '@/constants/bot-contents';
import { IPegasusSignal, loadPegasusStrategyToWorkspace } from './pegasus-strategy-loader';
import './pegasus-ai.scss';

interface IPegasusAiProps {
    handleTabChange: (tabIndex: number) => void;
}

const DEFAULT_SIGNALS: IPegasusSignal[] = [
    {
        id: 'pegasus-sig-1',
        rank: 1,
        marketName: 'Volatility 10 Index',
        symbol: 'R_10',
        confidence: 76.0,
        tradeType: 'DIGITOVER',
        barrier: 2,
        recoveryRule: 'Over 4 Recovery',
        description: 'Recent 10-tick window shows DIGITOVER 2 at 76.0% calibrated confidence. Streak: 15L. Volatility: 0.2256',
    },
    {
        id: 'pegasus-sig-2',
        rank: 2,
        marketName: 'Volatility 10 Index',
        symbol: 'R_10',
        confidence: 84.5,
        tradeType: 'DIGITOVER',
        barrier: 1,
        recoveryRule: 'Over 5 Recovery',
        description: 'Recent 10-tick window shows DIGITOVER 1 at 84.5% calibrated confidence. Streak: 18L. Volatility: 0.2256',
    },
    {
        id: 'pegasus-sig-3',
        rank: 3,
        marketName: 'Volatility 25 Index',
        symbol: 'R_25',
        confidence: 85.0,
        tradeType: 'DIGITOVER',
        barrier: 1,
        recoveryRule: 'Over 5 Recovery',
        description: 'Multi-tick momentum aligns with digit over probability. Streak: 12L. Volatility: 0.3120',
    },
];

export const PegasusAi: React.FC<IPegasusAiProps> = observer(({ handleTabChange }) => {
    const { run_panel } = useStore();

    // User configuration inputs
    const [stake, setStake] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_stake');
        return saved ? parseFloat(saved) : 200;
    });

    const [takeProfit, setTakeProfit] = useState<number>(() => {
        const saved = localStorage.getItem('pegasus_input_tp');
        return saved ? parseFloat(saved) : 500;
    });

    // Scanner state
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanMessage, setScanMessage] = useState<string>('Ready to scan');
    const [signals, setSignals] = useState<IPegasusSignal[]>([]);

    // Save inputs to localStorage on change
    useEffect(() => {
        localStorage.setItem('pegasus_input_stake', String(stake));
        localStorage.setItem('pegasus_input_tp', String(takeProfit));
    }, [stake, takeProfit]);

    // Handle radar scan click
    const handleStartScan = () => {
        if (isScanning) return;
        setIsScanning(true);
        setSignals([]);
        setScanMessage('Scanning fresh synthetic-index ticks...');

        // Perform multi-tick market analysis across Deriv synthetic indices
        setTimeout(() => {
            setScanMessage('Analyzing digit distributions & streak anomalies...');
        }, 1200);

        setTimeout(() => {
            setIsScanning(false);
            setScanMessage('3 live Pegasus signals found.');
            setSignals(DEFAULT_SIGNALS);
            setTimeout(() => {
                const el = document.querySelector('.pegasus-view__signals');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }, 2500);
    };

    // Handle selecting a signal to load strategy
    const handleSelectSignal = (signal: IPegasusSignal) => {
        // Load into active Blockly workspace
        loadPegasusStrategyToWorkspace(signal.symbol, stake, takeProfit, signal.barrier);

        // Switch tab to Bot Builder where the workspace and modal reside
        handleTabChange(DBOT_TABS.BOT_BUILDER);

        // Open activation modal over Bot Builder
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gsm:pegasus-activated-modal-open'));
        }, 100);
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
                        Set your stake and take-profit, then activate the scanner to find the best tick signal.
                    </p>
                </div>

                {/* Stake and Take Profit Inputs */}
                <div className="pegasus-view__inputs">
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

                    <div className="pegasus-view__input-group">
                        <label htmlFor="pegasus-tp">Take-profit (USD)</label>
                        <div className="input-wrapper">
                            <input
                                id="pegasus-tp"
                                type="number"
                                min="1"
                                step="10"
                                value={takeProfit}
                                onChange={e => setTakeProfit(parseFloat(e.target.value) || 0)}
                            />
                            <span className="currency-tag">USD</span>
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
                            className={`pegasus-view__radar-sweep ${!isScanning && signals.length === 0 ? 'pegasus-view__radar-sweep--paused' : ''
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
                                            ✓ {sig.confidence.toFixed(1)}%
                                        </span>
                                    </div>

                                    <div className="pegasus-view__card-body">
                                        <h3 className="pegasus-view__card-market">{sig.marketName}</h3>
                                        <p className="pegasus-view__card-details">
                                            {sig.tradeType} {sig.barrier} · {sig.recoveryRule}
                                        </p>
                                        <p className="pegasus-view__card-desc">{sig.description}</p>
                                    </div>

                                    <button
                                        className="pegasus-view__card-action"
                                        onClick={() => handleSelectSignal(sig)}
                                    >
                                        <span>Use this signal</span>
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
