type TBrandLogoProps = {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
};

export const BrandLogo = ({
    width = 160,
    height = 36,
    fill = '#D4AF37',
    className = ''
}: TBrandLogoProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 180 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Gold Standard Market Logo"
        >
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9E076" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#997A15" />
                </linearGradient>
                <linearGradient id="shieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E2333" />
                    <stop offset="100%" stopColor="#0F111A" />
                </linearGradient>
            </defs>

            {/* Emblem / Shield Badge */}
            <g transform="translate(4, 2)">
                {/* Shield Border */}
                <polygon
                    points="18,1 33,6 33,24 18,34 3,24 3,6"
                    fill="url(#shieldBg)"
                    stroke="url(#goldGradient)"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                {/* Bullion / Market Trend Chart Peak */}
                <polygon
                    points="18,7 28,12 25,23 18,28 11,23 8,12"
                    fill="url(#goldGradient)"
                    opacity="0.25"
                />
                <polyline
                    points="9,20 14,14 18,18 24,10 27,13"
                    stroke="url(#goldGradient)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="27" cy="10" r="1.5" fill="#FFF" />
            </g>

            {/* Typography */}
            <g transform="translate(46, 17)">
                <text
                    x="0"
                    y="0"
                    fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                    fontSize="13"
                    fontWeight="800"
                    letterSpacing="1.8px"
                    fill="url(#goldGradient)"
                >
                    GOLD STANDARD
                </text>
                <text
                    x="0"
                    y="14"
                    fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                    fontSize="9"
                    fontWeight="600"
                    letterSpacing="3.5px"
                    fill="#94A3B8"
                >
                    MARKET
                </text>
            </g>
        </svg>
    );
};
