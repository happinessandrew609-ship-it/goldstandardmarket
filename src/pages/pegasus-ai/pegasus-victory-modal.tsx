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
            <div className="pegasus-modal pegasus-modal--victory" onClick={e => e.stopPropagation()}>
                <button className="pegasus-modal__close" onClick={onContinue} aria-label="Close modal">
                    ✕
                </button>

                {/* Top Cyborg Visual Banner */}
                <div className="pegasus-modal__banner">
                    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="pegasus-modal__banner-svg">
                        <defs>
                            <linearGradient id="cyborg-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="50%" stopColor="#2563eb" />
                                <stop offset="100%" stopColor="#0f172a" />
                            </linearGradient>
                            <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="40%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                            <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#facc15" />
                                <stop offset="100%" stopColor="#eab308" />
                            </linearGradient>
                        </defs>

                        {/* Dark Grid Background */}
                        <rect width="320" height="160" rx="12" fill="#040a16" />
                        <path d="M0 40H320 M0 80H320 M0 120H320 M60 0V160 M120 0V160 M180 0V160 M240 0V160" stroke="#1e293b" strokeWidth="0.8" opacity="0.3" />

                        {/* Glowing Circular Aura */}
                        <circle cx="160" cy="80" r="55" fill="url(#cyborg-glow)" opacity="0.25" />

                        {/* Futuristic AI Cyborg Profile / Face */}
                        <g transform="translate(110, 20)">
                            {/* Head Silhouette */}
                            <path
                                d="M50 10 C25 10, 10 28, 10 55 C10 75, 20 95, 35 108 L38 120 H62 L65 108 C80 95, 90 75, 90 55 C90 28, 75 10, 50 10 Z"
                                fill="#0b1528"
                                stroke="url(#gold-accent)"
                                strokeWidth="1.8"
                            />
                            {/* Brain Neuro Mesh & Circuity */}
                            <path d="M28 42 H72 M22 55 H78 M30 68 H70 M50 20 V105" stroke="#38bdf8" strokeWidth="1.2" opacity="0.75" strokeDasharray="3 3" />
                            <path d="M35 32 L65 80 M65 32 L35 80" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

                            {/* Glowing Cyborg Eyes */}
                            <ellipse cx="36" cy="52" rx="6" ry="3" fill="url(#eye-glow)" />
                            <ellipse cx="64" cy="52" rx="6" ry="3" fill="url(#eye-glow)" />

                            {/* Cheek & Chin Circuits */}
                            <line x1="42" y1="85" x2="58" y2="85" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="50" cy="72" r="4" fill="#38bdf8" />
                        </g>

                        {/* Floating Golden Particles */}
                        <circle cx="60" cy="40" r="2" fill="#facc15">
                            <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="260" cy="45" r="2.5" fill="#38bdf8">
                            <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="80" cy="120" r="1.5" fill="#22c55e">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="240" cy="115" r="2" fill="#facc15">
                            <animate attributeName="opacity" values="1;0.3;1" dur="2.1s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>

                <div className="pegasus-modal__content-victory">
                    {/* Profit Target Reached Pill */}
                    <div className="pegasus-modal__victory-pill">
                        <span className="pegasus-modal__victory-dot" />
                        <span>PROFIT TARGET REACHED</span>
                    </div>

                    <div className="pegasus-modal__victory-text">
                        <h3 className="pegasus-modal__victory-eyebrow">PEGASUS AI</h3>
                        <p className="pegasus-modal__victory-subtitle">hit a profit of</p>
                        <div className="pegasus-modal__victory-amount">
                            {formattedProfit} {currency}
                        </div>
                    </div>

                    <button className="pegasus-modal__btn-continue" onClick={onContinue}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};
