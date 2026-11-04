import React from 'react';

interface IPegasusActivatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActivate: () => void;
}

export const PegasusActivatedModal: React.FC<IPegasusActivatedModalProps> = ({
    isOpen,
    onClose,
    onActivate,
}) => {
    if (!isOpen) return null;

    return (
        <div className="pegasus-modal-backdrop" onClick={onClose}>
            <div className="pegasus-modal" onClick={e => e.stopPropagation()}>
                <button className="pegasus-modal__close" onClick={onClose} aria-label="Close modal">
                    ✕
                </button>

                <div className="pegasus-modal__top-info">
                    <h2 className="pegasus-modal__title pegasus-modal__title--gold">
                        PEGASUS ACTIVATED
                    </h2>
                    <div className="pegasus-modal__status-pill">
                        <span className="pegasus-modal__status-dot" />
                        <span>PEGASUS CORE ONLINE</span>
                    </div>
                </div>

                <div className="pegasus-modal__art pegasus-modal__art--creation">
                    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="pegasus-modal__art-svg">
                        <defs>
                            <linearGradient id="neural-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="cyber-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#facc15" />
                                <stop offset="100%" stopColor="#eab308" />
                            </linearGradient>
                            <radialGradient id="spark-core" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="40%" stopColor="#67e8f9" />
                                <stop offset="80%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                            <filter id="core-bloom">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background Data Grid */}
                        <rect width="320" height="180" rx="12" fill="#050c1a" />
                        <path d="M0 45H320 M0 90H320 M0 135H320 M80 0V180 M160 0V180 M240 0V180" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />

                        {/* Floating Floating Hex / Chat Icon Overlays */}
                        <g opacity="0.6">
                            <rect x="35" y="24" width="46" height="22" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                            <circle cx="48" cy="35" r="2" fill="#38bdf8" />
                            <circle cx="58" cy="35" r="2" fill="#38bdf8" />
                            <circle cx="68" cy="35" r="2" fill="#38bdf8" />

                            <rect x="235" y="24" width="48" height="22" rx="4" fill="#0f172a" stroke="#facc15" strokeWidth="0.8" />
                            <path d="M246 35H272" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 2" />
                        </g>

                        {/* Left Human Hand (Stylized Silhouette) */}
                        <path
                            d="M0 135 C35 125, 75 118, 105 106 C115 102, 130 96, 142 90 L146 92 C135 100, 115 110, 85 125 C60 135, 25 145, 0 152 Z"
                            fill="#334155"
                            stroke="#64748b"
                            strokeWidth="1.2"
                        />
                        <path d="M100 108 L142 90" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

                        {/* Right Robot Hand (Cybernetic Silhouette with Gold & Blue Wireframe) */}
                        <path
                            d="M320 135 C285 125, 245 118, 215 106 C205 102, 190 96, 178 90 L174 92 C185 100, 205 110, 235 125 C260 135, 295 145, 320 152 Z"
                            fill="#0f172a"
                            stroke="url(#cyber-gold)"
                            strokeWidth="1.5"
                        />
                        {/* Robot Finger Segments & Circuitry */}
                        <path d="M220 108 L178 90" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="215" cy="106" r="3" fill="#38bdf8" />
                        <circle cx="195" cy="98" r="2.5" fill="#facc15" />
                        <line x1="230" y1="116" x2="260" y2="128" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 3" />
                        <line x1="240" y1="122" x2="270" y2="134" stroke="#facc15" strokeWidth="1.2" />

                        {/* Central Neural Connection Spark (Where hands meet) */}
                        <circle cx="160" cy="91" r="28" fill="url(#neural-glow)" />
                        <circle cx="160" cy="91" r="14" fill="url(#spark-core)" filter="url(#core-bloom)">
                            <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="160" cy="91" r="4" fill="#ffffff" />

                        {/* Radiating Lightning Sparks */}
                        <path d="M152 86 L144 80 M168 86 L176 80 M160 80 L160 70 M153 98 L145 104 M167 98 L175 104" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
                        </path>
                    </svg>
                </div>

                <p className="pegasus-modal__message">
                    Pegasus is synchronized with your selected signal. Confirm activation to begin automated trading.
                </p>

                <div className="pegasus-modal__actions">
                    <button
                        className="pegasus-modal__btn-activate"
                        onClick={() => {
                            onActivate();
                        }}
                    >
                        Activate Pegasus
                    </button>
                    <button className="pegasus-modal__btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
