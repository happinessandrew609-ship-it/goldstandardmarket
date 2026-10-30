import { sequence } from '@/components/shared';

const getTrueRange = (current, previous) => {
    const high = current.high ?? current;
    const low = current.low ?? current;
    if (!previous) {
        return Math.abs(high - low);
    }
    const prevClose = previous.close ?? previous;
    return Math.max(
        Math.abs(high - low),
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
    );
};

/**
 * @param {Array} data - Array of candles or price values
 * @param {Object} config - { periods: number, pipSize?: number }
 */
export const averageTrueRange = (data, config) => {
    const { periods } = config;

    if (!data || data.length < periods) {
        throw new Error('Periods longer than data length');
    }

    const trValues = [];
    for (let i = 0; i < data.length; i++) {
        trValues.push(getTrueRange(data[i], data[i - 1]));
    }

    // Initial ATR is simple average of first 'periods' TRs
    let atr = trValues.slice(0, periods).reduce((acc, val) => acc + val, 0) / periods;

    // Smoothed Wilder's ATR for remaining periods
    for (let i = periods; i < trValues.length; i++) {
        atr = (atr * (periods - 1) + trValues[i]) / periods;
    }

    return atr;
};

/**
 * @param {Array} data - Array of candles or price values
 * @param {Object} config - { periods: number, pipSize?: number }
 */
export const averageTrueRangeArray = (data, config) => {
    const { periods, pipSize = 2 } = config;

    if (!data || data.length < periods) {
        return [];
    }

    return sequence(data.length - periods + 1).map((x, i) => {
        const slice = data.slice(0, i + periods);
        return +averageTrueRange(slice, config).toFixed(pipSize);
    });
};
