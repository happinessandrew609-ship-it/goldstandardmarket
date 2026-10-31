import React, { useEffect, useRef, useState } from 'react';

type TTick = {
    time: number;
    quote: number;
};

const MARKETS = [
    { value: '1HZ10V', label: 'Volatility 10 (1s) Index' },
    { value: 'R_10', label: 'Volatility 10 Index' },
    { value: '1HZ25V', label: 'Volatility 25 (1s) Index' },
    { value: 'R_25', label: 'Volatility 25 Index' },
    { value: '1HZ50V', label: 'Volatility 50 (1s) Index' },
    { value: 'R_50', label: 'Volatility 50 Index' },
    { value: '1HZ75V', label: 'Volatility 75 (1s) Index' },
    { value: 'R_75', label: 'Volatility 75 Index' },
    { value: '1HZ100V', label: 'Volatility 100 (1s) Index' },
    { value: 'R_100', label: 'Volatility 100 Index' },
];

export const DCircles: React.FC = () => {
    const [ticks, setTicks] = useState<TTick[]>([]);
    const [symbol, setSymbol] = useState<string>('R_10');
    const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
    const [currentQuote, setCurrentQuote] = useState<number | null>(null);
    const [pipSize, setPipSize] = useState<number>(2);
    const [patternMode, setPatternMode] = useState<'evenodd' | 'overunder'>('evenodd');
    const wsRef = useRef<WebSocket | null>(null);

    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=113982');
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    ticks_history: symbol,
                    count: 1000,
                    end: 'latest',
                    style: 'ticks',
                    subscribe: 1,
                })
            );
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.history) {
                    const historyTicks: TTick[] = data.history.prices.map((p: string, idx: number) => ({
                        time: data.history.times[idx],
                        quote: parseFloat(p),
                    }));
                    setTicks(historyTicks);
                    if (data.pip_size !== undefined) {
                        setPipSize(data.pip_size);
                    }
                    if (historyTicks.length > 0) {
                        setCurrentQuote(historyTicks[historyTicks.length - 1].quote);
                    }
                } else if (data.tick) {
                    const newTick: TTick = {
                        time: data.tick.epoch,
                        quote: parseFloat(data.tick.quote),
                    };
                    setTicks(prev => [...prev.slice(-999), newTick]);
                    setCurrentQuote(newTick.quote);
                    if (data.tick.pip_size !== undefined) {
                        setPipSize(data.tick.pip_size);
                    }
                }
            } catch (e) {
                console.error('[DCircles] Parse error:', e);
            }
        };
    };

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [symbol]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('dcircles-market-change', { detail: { symbol } }));
    }, [symbol]);

    const getDigit = (quote: number) => {
        const str = quote.toFixed(pipSize);
        return parseInt(str.slice(-1), 10);
    };

    const digitCounts = Array(10).fill(0);
    ticks.forEach(t => {
        const d = getDigit(t.quote);
        if (d >= 0 && d <= 9) digitCounts[d]++;
    });

    const totalTicks = ticks.length || 1;
    const digitPercentages = digitCounts.map(count => (count / totalTicks) * 100);
    const activeDigit = currentQuote !== null ? getDigit(currentQuote) : null;

    const maxPct = Math.max(...digitPercentages);
    const minPct = Math.min(...digitPercentages.filter(pct => pct > 0));

    const sortedDigits = digitPercentages
        .map((pct, digit) => ({ digit, pct }))
        .filter(d => d.pct > 0)
        .sort((a, b) => b.pct - a.pct);

    let evenCount = 0;
    let oddCount = 0;
    ticks.forEach(t => {
        if (getDigit(t.quote) % 2 === 0) evenCount++;
        else oddCount++;
    });
    const evenOdd = {
        even: (evenCount / totalTicks) * 100,
        odd: (oddCount / totalTicks) * 100,
    };

    let riseCount = 0;
    let fallCount = 0;
    for (let i = 1; i < ticks.length; i++) {
        if (ticks[i].quote > ticks[i - 1].quote) riseCount++;
        else if (ticks[i].quote < ticks[i - 1].quote) fallCount++;
    }
    const movementCount = Math.max(1, ticks.length - 1);
    const movement = {
        rises: (riseCount / movementCount) * 100,
        falls: (fallCount / movementCount) * 100,
    };

    const last50Digits = ticks.slice(-50).map(t => getDigit(t.quote));

    return (
        <div className='dcircles-container'>
            <div className='dcircles-header'>
                <div className='price-display'>
                    <div className='current-price'>{currentQuote !== null ? currentQuote.toFixed(pipSize) : 'N/A'}</div>
                    <div className='price-label'>Current Price</div>
                </div>

                <div className='market-selector'>
                    <select value={symbol} onChange={e => setSymbol(e.target.value)}>
                        {MARKETS.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <div className='selector-label'>MARKET</div>
                </div>
            </div>

            <section className='analysis-section'>
                <h2>Digit Distribution</h2>
                <div className='digit-grid'>
                    {digitPercentages.map((pct, d) => {
                        const ringFill = maxPct > 0 ? (pct / maxPct) * 100 : 0;
                        let color = '#4b5563';
                        if (d === sortedDigits[0]?.digit) color = '#10b981';
                        else if (d === sortedDigits[1]?.digit) color = '#3b82f6';
                        else if (d === sortedDigits[sortedDigits.length - 1]?.digit) color = '#ef4444';
                        else if (d === sortedDigits[sortedDigits.length - 2]?.digit) color = '#eab308';

                        return (
                            <div key={d} className='digit-container'>
                                {d === activeDigit && (
                                    <div className='current-indicator'>
                                        <svg width='10' height='8' viewBox='0 0 20 16' fill='none'>
                                            <path d='M10 16L0 0H20L10 16Z' fill='#fbbf24' />
                                        </svg>
                                    </div>
                                )}
                                <div className='digit-circle-wrapper'>
                                    <div className='digit-circle'>
                                        <svg className='progress-ring' viewBox='0 0 64 64'>
                                            <circle cx='32' cy='32' r='28' fill='none' stroke='rgba(200,200,200,0.3)' strokeWidth='4' />
                                            <circle
                                                cx='32'
                                                cy='32'
                                                r='28'
                                                fill='none'
                                                stroke={color}
                                                strokeWidth='4'
                                                strokeDasharray={`${(ringFill / 100) * 175.9} 175.9`}
                                                strokeLinecap='round'
                                                transform='rotate(-90 32 32)'
                                            />
                                        </svg>
                                        <div className='digit-content'>
                                            <div className='digit-number' style={{ color }}>
                                                {d}
                                            </div>
                                            <div className='digit-percentage' style={{ color }}>
                                                {pct.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className='analysis-stats'>
                    Highest: <span className='stat-highest'>{maxPct.toFixed(2)}%</span> | 2nd:{' '}
                    <span style={{ color: '#3b82f6' }}>{sortedDigits[1]?.pct.toFixed(2) ?? '—'}%</span> | Lowest:{' '}
                    <span className='stat-lowest'>{minPct.toFixed(2)}%</span> | 2nd Low:{' '}
                    <span style={{ color: '#eab308' }}>{sortedDigits[sortedDigits.length - 2]?.pct.toFixed(2) ?? '—'}%</span>
                </div>
            </section>

            <section className='analysis-section'>
                <div className='section-header-with-toggle'>
                    <h2>Pattern Analysis</h2>
                    <div className='toggle-buttons'>
                        <button
                            className={`toggle-btn ${patternMode === 'evenodd' ? 'active' : ''}`}
                            onClick={() => setPatternMode('evenodd')}
                        >
                            Even/Odd
                        </button>
                        <button
                            className={`toggle-btn ${patternMode === 'overunder' ? 'active' : ''}`}
                            onClick={() => setPatternMode('overunder')}
                        >
                            Over/Under
                        </button>
                    </div>
                </div>

                {patternMode === 'evenodd' ? (
                    <React.Fragment>
                        <div className='eo-grid'>
                            <div className='stat-card even'>
                                <div className='stat-value'>{evenOdd.even.toFixed(1)}%</div>
                                <div className='stat-label'>Even</div>
                            </div>
                            <div className='stat-card odd'>
                                <div className='stat-value'>{evenOdd.odd.toFixed(1)}%</div>
                                <div className='stat-label'>Odd</div>
                            </div>
                        </div>

                        <div className='last-digits-pattern'>
                            <div className='pattern-label'>Last 50 Digits Pattern</div>
                            <div className='digits-stream-mini'>
                                {last50Digits.map((d, idx) => (
                                    <span key={idx} className={`digit-badge ${d % 2 === 0 ? 'even' : 'odd'}`}>
                                        {d % 2 === 0 ? 'E' : 'O'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <div className='digit-selector'>
                            <div className='selector-label-small'>SELECT A DIGIT TO ANALYZE:</div>
                            <div className='digit-buttons'>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <button
                                        key={num}
                                        className={`digit-btn ${selectedDigit === num ? 'selected' : ''}`}
                                        onClick={() => setSelectedDigit(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='overunder-grid'>
                            {(() => {
                                const target = selectedDigit ?? 4;
                                let over = 0;
                                let equal = 0;
                                let under = 0;
                                ticks.forEach(t => {
                                    const d = getDigit(t.quote);
                                    if (d > target) over++;
                                    else if (d === target) equal++;
                                    else under++;
                                });
                                return (
                                    <>
                                        <div className='stat-card over'>
                                            <div className='stat-value'>{((over / totalTicks) * 100).toFixed(1)}%</div>
                                            <div className='stat-label'>Over {target}</div>
                                        </div>
                                        {selectedDigit !== null && (
                                            <div className='stat-card equal'>
                                                <div className='stat-value'>{((equal / totalTicks) * 100).toFixed(1)}%</div>
                                                <div className='stat-label'>Equal to {target}</div>
                                            </div>
                                        )}
                                        <div className='stat-card under'>
                                            <div className='stat-value'>{((under / totalTicks) * 100).toFixed(1)}%</div>
                                            <div className='stat-label'>Under {target}</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className='last-digits-pattern'>
                            <div className='pattern-label'>
                                Last 50 Digits {selectedDigit !== null ? `(vs ${selectedDigit})` : '(vs 4)'}
                            </div>
                            <div className='digits-stream-mini'>
                                {last50Digits.map((d, idx) => {
                                    const target = selectedDigit ?? 4;
                                    const badgeClass = d > target ? 'over' : d === target ? 'equal' : 'under';
                                    return (
                                        <span key={idx} className={`digit-badge ${badgeClass}`}>
                                            {d}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </section>

            <section className='analysis-section'>
                <h2>Market Movement</h2>
                <div className='eo-grid'>
                    <div className='stat-card rise'>
                        <div className='stat-value'>{movement.rises.toFixed(1)}%</div>
                        <div className='stat-label'>RISE</div>
                    </div>
                    <div className='stat-card fall'>
                        <div className='stat-value'>{movement.falls.toFixed(1)}%</div>
                        <div className='stat-label'>FALL</div>
                    </div>
                </div>
            </section>

            <section className='analysis-section'>
                <h2>Last Digits Stream</h2>
                <div className='digits-stream'>
                    {ticks
                        .slice(-100)
                        .reverse()
                        .map((t, idx) => {
                            const d = getDigit(t.quote);
                            return (
                                <span key={idx} className={`digit-badge ${d % 2 === 0 ? 'even' : 'odd'}`}>
                                    {d}
                                </span>
                            );
                        })}
                </div>
            </section>
        </div>
    );
};

export default DCircles;
