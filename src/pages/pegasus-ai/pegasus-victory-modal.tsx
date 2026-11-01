import React from 'react';

interface IPegasusVictoryModalProps {
    isOpen: boolean;
    profitAmount: number | string;
    currency?: string;
    onContinue: () => void;
}

export const PegasusVictoryModal: React.FC<IPegasusVictoryModalProps> = ({
    isOpen,
    profitAmount,
    currency = 'USD',
    onContinue,
}) => {
    if (!isOpen) return null;

    const formattedProfit = typeof profitAmount === 'number' ? profitAmount.toFixed(2) : profitAmount;

    return (
        <div className="pegasus-modal-backdrop" onClick={onContinue}>
            <div className="pegasus-modal" onClick={e => e.stopPropagation()}>
                <span className="pegasus-modal__badge pegasus-modal__badge--victory">
                    ✓ PROFIT TARGET REACHED
                </span>

                <div className="pegasus-modal__art">
                    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="victory-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                                <stop offset="60%" stopColor="#16a34a" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#facc15" />
                                <stop offset="100%" stopColor="#ca8a04" />
                            </linearGradient>
                        </defs>

                        {/* Victory circular radiance */}
                        <circle cx="80" cy="80" r="72" stroke="url(#gold-grad)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.8">
                            <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="16s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="80" cy="80" r="54" fill="url(#victory-glow)" />

                        {/* Cyborg profile with laurel / victory crown */}
                        <path
                            d="M80 34C58 34 40 50 40 72C40 92 52 108 68 116L68 126H92L92 116C108 108 120 92 120 72C120 50 102 34 80 34Z"
                            stroke="url(#gold-grad)"
                            strokeWidth="2.5"
                            fill="rgba(15, 23, 42, 0.85)"
                        />
                        <path d="M62 60L72 70L98 48" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <text x="80" y="102" textAnchor="middle" fill="#fde047" fontSize="13" fontWeight="900" letterSpacing="0.1em">
                            WINNER
                        </text>
                    </svg>
                </div>

                <h2 className="pegasus-modal__title">
                    PEGASUS AI<br />
                    hit a profit of <span style={{ color: '#4ade80' }}>{formattedProfit} {currency}</span>
                </h2>

                <p className="pegasus-modal__message">
                    Your profit target has been achieved successfully with automated risk management.
                </p>

                <button className="pegasus-modal__btn-continue" onClick={onContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};
