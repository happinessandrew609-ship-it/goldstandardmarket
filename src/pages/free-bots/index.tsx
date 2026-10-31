import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DBOT_TABS } from '@/constants/bot-contents';

type TFreeBotsProps = {
    handleTabChange: (tab_index: number) => void;
};

type TBotItem = {
    id: string;
    name: string;
    file: string;
    category: string;
    desc: string;
    confidence: number;
    zscore: number;
    mtfAgree: number;
    risk: string;
    strategy: string;
};

const XML_BOT_FILES = [
    'Digit Switcher Bot (correction) (1)',
    'Dollar Printer (correction) (1)',
    'GOLD-PREMIUM-ODD-AND-EVEN',
    'Profit_MAKER_BOT (correct) (1) (1)',
];

const BOT_CATALOG: TBotItem[] = XML_BOT_FILES.map(fileName => {
    const extraDigits = Array.from(new Set((fileName.match(/\(\d+\)/g) ?? []).map(x => x.trim())));
    const cleanName = fileName
        .replace(/\.xml$/i, '')
        .replace(/\s*\((?:correction|correct)\)\s*/gi, ' ')
        .replace(/\s*\(\d+\)/g, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\bDolllar\b/gi, 'Dollar')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

    const name = extraDigits.length ? `${cleanName} ${extraDigits.join(' ')}` : cleanName;
    const lower = fileName.toLowerCase();

    let meta = {
        category: 'XML Strategy',
        desc: 'Prebuilt XML trading strategy available to load straight into Bot Builder.',
        confidence: 85,
        zscore: 7.1,
        mtfAgree: 87,
        risk: 'Medium',
        strategy: 'XML Setup',
    };

    if (lower.includes('odd') || lower.includes('even')) {
        meta = {
            category: 'Even/Odd',
            desc: 'Odd/even-focused XML strategy ready to load directly into Bot Builder.',
            confidence: 90,
            zscore: 8.35,
            mtfAgree: 93,
            risk: 'High',
            strategy: 'Premium O/E',
        };
    } else if (lower.includes('profit_maker')) {
        meta = {
            category: 'Premium',
            desc: 'Profit-oriented XML bot with structured stake progression and recovery paths.',
            confidence: 91,
            zscore: 8.9,
            mtfAgree: 94,
            risk: 'High',
            strategy: 'Progression',
        };
    } else if (lower.includes('printer')) {
        meta = {
            category: 'Premium',
            desc: 'Fast-cycle XML bot tuned for repeated entries and compounding opportunities.',
            confidence: 89,
            zscore: 8.55,
            mtfAgree: 91,
            risk: 'High',
            strategy: 'Cycle Compound',
        };
    } else if (lower.includes('switcher')) {
        meta = {
            category: 'Digits',
            desc: 'Digit-state XML bot that switches execution logic based on recent tick behavior.',
            confidence: 86,
            zscore: 7.3,
            mtfAgree: 88,
            risk: 'Medium',
            strategy: 'State Switch',
        };
    }

    return {
        id: `xml_${fileName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`,
        name,
        file: fileName,
        ...meta,
    };
});

export const FreeBots = observer(({ handleTabChange }: TFreeBotsProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), ok ? 4000 : 6000);
    };

    const categories = ['All', ...Array.from(new Set(BOT_CATALOG.map(b => b.category)))];
    const filteredBots = selectedCategory === 'All' ? BOT_CATALOG : BOT_CATALOG.filter(b => b.category === selectedCategory);

    const loadBot = async (bot: TBotItem) => {
        setLoadingId(bot.id);
        try {
            const url = `/bots/${encodeURIComponent(bot.file)}.xml`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const xmlText = await res.text();
            const ws = (window as any).Blockly?.derivWorkspace;
            if (!ws) throw new Error('Workspace not ready — please open Bot Builder first');

            ws.asyncClear();
            (window as any).Blockly.Xml.domToWorkspace(
                (window as any).Blockly.utils.xml.textToDom(xmlText),
                ws
            );
            handleTabChange(DBOT_TABS.BOT_BUILDER);
            showToast(`✓ "${bot.name}" loaded in Bot Builder`, true);
        } catch (err: any) {
            showToast(`✗ Failed to load "${bot.name}": ${err?.message || 'Unknown error'}`, false);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className='bots-library'>
            <div className='bots-library__header'>
                <h1>Bot Library</h1>
                <p>Choose a bot and load it into Bot Builder.</p>
            </div>

            {toast && (
                <div className={`bots-library__toast ${toast.ok ? 'bots-library__toast--ok' : 'bots-library__toast--err'}`}>
                    {toast.msg}
                </div>
            )}

            <div className='bots-library__categories'>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`bots-library__cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className='bots-library__grid'>
                {filteredBots.map(bot => (
                    <div key={bot.id} className='bl-card'>
                        <h3 className='bl-card__title'>{bot.name}</h3>
                        <p className='bl-card__desc'>{bot.desc}</p>
                        <button
                            className='bl-card__btn'
                            onClick={() => loadBot(bot)}
                            disabled={loadingId === bot.id}
                        >
                            {loadingId === bot.id ? 'Loading...' : 'Load Bot'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default FreeBots;
