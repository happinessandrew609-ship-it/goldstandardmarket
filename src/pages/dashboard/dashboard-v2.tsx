import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';

type TDashboardV2Props = {
    handleTabChange: (tab_index: number) => void;
};

const SOCIAL_LINKS = [
    {
        id: 'whatsapp',
        href: 'https://wa.me/2349122821110',
        title: 'WhatsApp',
        color: '#25D366',
        glow: 'rgba(37,211,102,0.4)',
        icon: (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='#25D366' xmlns='http://www.w3.org/2000/svg'>
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
        ),
    },
    {
        id: 'telegram',
        href: 'https://t.me/Goldstandardmarkets',
        title: 'Telegram',
        color: '#0088cc',
        glow: 'rgba(0,136,204,0.4)',
        icon: (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='#0088cc' xmlns='http://www.w3.org/2000/svg'>
                <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
            </svg>
        ),
    },
    {
        id: 'youtube',
        href: 'https://youtube.com/@goldstandardmarket?si=hdVHorkasdVgmWqj',
        title: 'YouTube',
        color: '#FF0000',
        glow: 'rgba(255,0,0,0.35)',
        icon: (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='#FF0000' xmlns='http://www.w3.org/2000/svg'>
                <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
            </svg>
        ),
    },
    {
        id: 'tiktok',
        href: 'https://www.tiktok.com/@goldstandardmarket?_r=1&_t=ZS-925N0iQhvBy',
        title: 'TikTok',
        color: '#00F2EA',
        glow: 'rgba(0,242,234,0.4)',
        icon: (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='#00F2EA' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.34.88.22 1.82.09 2.59-.4.76-.46 1.28-1.25 1.44-2.13.08-.49.09-.98.09-1.47V.02z' />
            </svg>
        ),
    },
];

export const DashboardV2 = observer(({ handleTabChange }: TDashboardV2Props) => {
    const { client, load_modal } = useStore();
    const is_logged_in = client?.is_logged_in;
    const [viewMode, setViewMode] = useState<'dashboard' | 'trading_plan'>('dashboard');

    const handleCardClick = (cardId: string, tab: number) => {
        if (cardId === 'my_computer') {
            handleTabChange(DBOT_TABS.BOT_BUILDER);
            load_modal?.toggleLoadModal();
        } else if (cardId === 'google_drive') {
            handleTabChange(DBOT_TABS.BOT_BUILDER);
            load_modal?.setActiveTabIndex(1);
            load_modal?.toggleLoadModal();
        } else {
            handleTabChange(tab);
        }
    };

    const cards = [
        {
            id: 'my_computer',
            label: 'My computer',
            desc: 'Import from your device',
            tab: DBOT_TABS.BOT_BUILDER,
            color: '#3b82f6',
            action: 'OPEN →',
            Icon: () => (
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <rect x='4' y='6' width='36' height='24' rx='3' stroke='#3b82f6' strokeWidth='1.8' fill='rgba(59,130,246,0.08)' />
                    <rect x='7' y='9' width='30' height='18' rx='1.5' fill='rgba(59,130,246,0.15)' />
                    <rect className='dash-icon-scan' x='7' y='9' width='30' height='2' rx='1' fill='rgba(59,130,246,0.4)' />
                    <path d='M17 30 L16 37 M27 30 L28 37' stroke='#3b82f6' strokeWidth='1.8' strokeLinecap='round' />
                    <path d='M13 37 L31 37' stroke='#3b82f6' strokeWidth='1.8' strokeLinecap='round' />
                    <g className='dash-icon-upload'>
                        <path d='M22 24 L22 17' stroke='#3b82f6' strokeWidth='1.5' strokeLinecap='round' />
                        <path d='M19 20 L22 17 L25 20' stroke='#3b82f6' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </g>
                </svg>
            ),
        },
        {
            id: 'google_drive',
            label: 'Google Drive',
            desc: 'Load from Google Drive',
            tab: DBOT_TABS.BOT_BUILDER,
            color: '#10b981',
            action: 'OPEN →',
            Icon: () => (
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M12 28 C8 28 5 25 5 21 C5 17.5 7.5 14.5 11 14 C11.5 10 15 7 19.5 7 C23 7 26 9 27.5 12 C28 12 28.5 12 29 12 C33 12 36 15 36 19 C36 23.5 32.5 27 28 27 L12 28Z' stroke='#10b981' strokeWidth='1.8' fill='rgba(16,185,129,0.08)' />
                    <g className='dash-icon-plus'>
                        <path d='M22 19 L22 27' stroke='#10b981' strokeWidth='2' strokeLinecap='round' />
                        <path d='M18 23 L26 23' stroke='#10b981' strokeWidth='2' strokeLinecap='round' />
                    </g>
                    <ellipse className='dash-icon-orbit' cx='22' cy='23' rx='10' ry='4' stroke='rgba(16,185,129,0.3)' strokeWidth='1' fill='none' strokeDasharray='3 2' />
                </svg>
            ),
        },
        {
            id: 'bot_builder',
            label: 'Bot Builder',
            desc: 'Build blocks visually',
            tab: DBOT_TABS.BOT_BUILDER,
            color: '#8b5cf6',
            action: 'OPEN →',
            Icon: () => (
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <g className='dash-icon-gear-cw'>
                        <circle cx='22' cy='22' r='10' stroke='#8b5cf6' strokeWidth='1.8' fill='none' />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 22 + 10 * Math.cos(rad);
                            const y1 = 22 + 10 * Math.sin(rad);
                            const x2 = 22 + 13 * Math.cos(rad);
                            const y2 = 22 + 13 * Math.sin(rad);
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke='#8b5cf6' strokeWidth='2' strokeLinecap='round' />;
                        })}
                    </g>
                    <g className='dash-icon-gear-ccw'>
                        <circle cx='22' cy='22' r='5' stroke='#8b5cf6' strokeWidth='1.5' fill='rgba(139,92,246,0.15)' />
                    </g>
                    <circle cx='22' cy='22' r='2' fill='#8b5cf6' />
                    <rect x='5' y='5' width='7' height='7' rx='1.5' stroke='#8b5cf6' strokeWidth='1.2' fill='rgba(139,92,246,0.1)' />
                    <rect x='32' y='5' width='7' height='7' rx='1.5' stroke='#8b5cf6' strokeWidth='1.2' fill='rgba(139,92,246,0.1)' />
                    <rect x='5' y='32' width='7' height='7' rx='1.5' stroke='#8b5cf6' strokeWidth='1.2' fill='rgba(139,92,246,0.1)' />
                    <rect x='32' y='32' width='7' height='7' rx='1.5' stroke='#8b5cf6' strokeWidth='1.2' fill='rgba(139,92,246,0.1)' />
                </svg>
            ),
        },
        {
            id: 'quick_strategy',
            label: 'Quick strategy',
            desc: 'Start with a template',
            tab: DBOT_TABS.FREE_BOTS,
            color: '#f59e0b',
            action: 'OPEN →',
            Icon: () => (
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <g className='dash-icon-bars'>
                        <rect x='6' y='28' width='6' height='10' rx='1.5' fill='rgba(245,158,11,0.3)' stroke='#f59e0b' strokeWidth='1.2' />
                        <rect x='14' y='22' width='6' height='16' rx='1.5' fill='rgba(245,158,11,0.4)' stroke='#f59e0b' strokeWidth='1.2' />
                        <rect x='22' y='16' width='6' height='22' rx='1.5' fill='rgba(245,158,11,0.5)' stroke='#f59e0b' strokeWidth='1.2' />
                        <rect x='30' y='10' width='6' height='28' rx='1.5' fill='rgba(245,158,11,0.6)' stroke='#f59e0b' strokeWidth='1.2' />
                    </g>
                    <path className='dash-icon-trend' d='M6 32 L14 26 L22 20 L30 14 L38 8' stroke='#f59e0b' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' strokeDasharray='60' strokeDashoffset='0' />
                    <path d='M34 6 L38 8 L36 12' stroke='#f59e0b' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' fill='none' />
                </svg>
            ),
        },
        {
            id: 'speed_bot',
            label: 'Speed Bot',
            desc: 'High-speed trading engine',
            tab: DBOT_TABS.BOT_BUILDER,
            color: '#ec4899',
            action: 'OPEN →',
            Icon: () => (
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <rect x='10' y='12' width='24' height='20' rx='4' stroke='#ec4899' strokeWidth='1.8' fill='rgba(236,72,153,0.08)' />
                    <g className='dash-icon-eyes'>
                        <circle cx='17' cy='20' r='3' fill='rgba(236,72,153,0.2)' stroke='#ec4899' strokeWidth='1.2' />
                        <circle cx='27' cy='20' r='3' fill='rgba(236,72,153,0.2)' stroke='#ec4899' strokeWidth='1.2' />
                        <circle cx='17' cy='20' r='1.2' fill='#ec4899' />
                        <circle cx='27' cy='20' r='1.2' fill='#ec4899' />
                    </g>
                    <path d='M16 27 Q22 30 28 27' stroke='#ec4899' strokeWidth='1.5' strokeLinecap='round' fill='none' />
                    <g className='dash-icon-antenna'>
                        <line x1='22' y1='12' x2='22' y2='7' stroke='#ec4899' strokeWidth='1.5' strokeLinecap='round' />
                        <circle cx='22' cy='6' r='2' fill='#ec4899' />
                    </g>
                    <rect x='6' y='18' width='4' height='8' rx='2' stroke='#ec4899' strokeWidth='1.2' fill='rgba(236,72,153,0.1)' />
                    <rect x='34' y='18' width='4' height='8' rx='2' stroke='#ec4899' strokeWidth='1.2' fill='rgba(236,72,153,0.1)' />
                    <g className='dash-icon-speed'>
                        <line x1='4' y1='10' x2='9' y2='10' stroke='#ec4899' strokeWidth='1.2' strokeLinecap='round' opacity='0.5' />
                        <line x1='3' y1='14' x2='8' y2='14' stroke='#ec4899' strokeWidth='1.2' strokeLinecap='round' opacity='0.3' />
                    </g>
                </svg>
            ),
        },
    ];

    return (
        <div className='dashboard-v2'>
            <div className='dashboard-v2__container'>
                <div className='dashboard-v2__toggle'>
                    <button
                        className={`dashboard-v2__toggle-btn ${viewMode === 'dashboard' ? 'dashboard-v2__toggle-btn--active' : 'dashboard-v2__toggle-btn--inactive'}`}
                        onClick={() => setViewMode('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={`dashboard-v2__toggle-btn ${viewMode === 'trading_plan' ? 'dashboard-v2__toggle-btn--active' : 'dashboard-v2__toggle-btn--inactive'}`}
                        onClick={() => setViewMode('trading_plan')}
                    >
                        📈 Trading Plan
                    </button>
                </div>

                <div className='dashboard-v2__header'>
                    <div className='dashboard-v2__social-links'>
                        {SOCIAL_LINKS.map(link => (
                            <a
                                key={link.id}
                                href={link.href}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={`dashboard-v2__social-link dashboard-v2__social-link--${link.id}`}
                                title={link.title}
                                style={{
                                    ['--social-glow' as any]: link.glow,
                                    ['--social-color' as any]: link.color,
                                }}
                            >
                                <div className='dashboard-v2__social-icon'>{link.icon}</div>
                            </a>
                        ))}
                    </div>
                    <h1 className='dashboard-v2__title'>Load or build your bot</h1>
                    <p className='dashboard-v2__subtitle'>
                        Import a bot from your computer or Google Drive, build it from scratch, or start with a quick strategy.
                    </p>
                </div>

                <div className='dashboard-v2__cards'>
                    {cards.map(card => (
                        <div
                            key={card.id}
                            className='dashboard-v2__card'
                            onClick={() => handleCardClick(card.id, card.tab)}
                            style={{ ['--card-color' as any]: card.color }}
                        >
                            <div className='dashboard-v2__card-border' />
                            <div className='dashboard-v2__card-icon'>
                                <card.Icon />
                            </div>
                            <div className='dashboard-v2__card-content'>
                                <h3 className='dashboard-v2__card-title'>{card.label}</h3>
                                <p className='dashboard-v2__card-desc'>{card.desc}</p>
                            </div>
                            <button className='dashboard-v2__card-action'>{card.action}</button>
                        </div>
                    ))}
                </div>

                {!is_logged_in && (
                    <div className='dashboard-v2__notice'>
                        <strong>Not logged in.</strong> Log in to start trading and access all features.
                    </div>
                )}
            </div>
        </div>
    );
});

export default DashboardV2;

