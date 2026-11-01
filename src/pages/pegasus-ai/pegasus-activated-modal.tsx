import React from 'react';
import { useStore } from '@/hooks/useStore';

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

                <div className="pegasus-modal__art">
                    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="ai-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                                <stop offset="60%" stopColor="#2563eb" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="ai-circuit" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#facc15" />
                                <stop offset="50%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                            <filter id="hologram-bloom" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Outer rotating pulse ring */}
                        <circle cx="80" cy="80" r="70" stroke="url(#ai-circuit)" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.8">
                            <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="12s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="80" cy="80" r="58" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                        <circle cx="80" cy="80" r="50" fill="url(#ai-glow)" />

                        {/* Futuristic AI Cyborg Brain Mesh */}
                        <g filter="url(#hologram-bloom)">
                            <path
                                d="M80 32C56 32 38 48 38 72C38 88 48 102 62 112L62 124C62 126 64 128 66 128H94C96 128 98 126 98 124L98 112C112 102 122 88 122 72C122 48 104 32 80 32Z"
                                stroke="#facc15"
                                strokeWidth="2.2"
                                fill="rgba(15, 23, 42, 0.7)"
                            />
                            {/* Circuit nodes inside */}
                            <path d="M54 70H106 M80 44V116 M60 56L100 96 M100 56L60 96" stroke="#60a5fa" strokeWidth="1.2" opacity="0.65" strokeDasharray="3 3" />
                            <circle cx="80" cy="70" r="16" fill="rgba(37, 99, 235, 0.5)" stroke="#facc15" strokeWidth="1.8" />
                            <text x="80" y="76" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                                AI
                            </text>

                            {/* Glowing chin lines */}
                            <line x1="68" y1="120" x2="92" y2="120" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
                            <line x1="72" y1="124" x2="88" y2="124" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                        </g>

                        {/* Floating neural spark dots */}
                        <circle cx="48" cy="52" r="2.5" fill="#fde047">
                            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="112" cy="52" r="2.5" fill="#60a5fa">
                            <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="42" cy="85" r="2" fill="#22c55e">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="118" cy="85" r="2" fill="#facc15">
                            <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>

                <h2 className="pegasus-modal__title pegasus-modal__title--gold">
                    PEGASUS ACTIVATED
                </h2>
                <p className="pegasus-modal__message">
                    Pegasus is synchronized with your selected signal. Confirm activation to begin automated trading.
                </p>

                <div className="pegasus-modal__actions">
                    <button className="pegasus-modal__btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="pegasus-modal__btn-activate"
                        onClick={() => {
                            onActivate();
                            onClose();
                        }}
                    >
                        Activate Pegasus
                    </button>
                </div>
            </div>
        </div>
    );
};
