import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';

interface IAiLiveHudProps {
    onClick?: () => void;
}

export const AiLiveHud: React.FC<IAiLiveHudProps> = observer(({ onClick }) => {
    const { run_panel } = useStore();
    const { is_running } = run_panel;

    const isPegasusActive = localStorage.getItem('pegasus_is_active') === 'true';

    // Show when bot is running or Pegasus is active
    if (!is_running && !isPegasusActive) return null;

    return (
        <div className="pegasus-hud" onClick={onClick} title="Pegasus AI Engine is active">
            <div className="pegasus-hud__pill">
                <span className="pegasus-hud__icon">AI</span>
                <span className="pegasus-hud__label">AI LIVE</span>
                <span className="pegasus-hud__live-dot" />
            </div>
        </div>
    );
});

