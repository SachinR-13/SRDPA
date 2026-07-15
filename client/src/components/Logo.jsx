export default function Logo({ size = 40, showText = true, variant = 'default' }) {
  const iconSize = size;
  const textSize = size * 0.35;

  const gradientId = `srpay-gradient-${variant}`;
  const glowId = `srpay-glow-${variant}`;

  const colors = variant === 'admin'
    ? { from: '#EF4444', to: '#DC2626' }
    : { from: '#667eea', to: '#764ba2' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: showText ? 10 : 0,
      textDecoration: 'none',
    }}>
      {/* Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
          <filter id={glowId}>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={colors.from} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Background rounded square */}
        <rect
          x="5" y="5" width="90" height="90" rx="22" ry="22"
          fill={`url(#${gradientId})`}
          filter={`url(#${glowId})`}
        />

        {/* Wallet icon - simplified */}
        <rect x="22" y="35" width="56" height="38" rx="6" fill="white" opacity="0.95" />
        <rect x="22" y="35" width="56" height="10" rx="6" fill="white" opacity="0.7" />
        <rect x="22" y="39" width="56" height="4" fill={colors.from} opacity="0.15" />

        {/* Rupee symbol */}
        <text
          x="50" y="62"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Arial, sans-serif"
          fontWeight="800"
          fontSize="32"
          fill={colors.from}
        >₹</text>

        {/* Payment wave lines */}
        <path
          d="M18 68 Q 30 58, 50 68 Q 70 78, 82 68"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M22 74 Q 35 66, 50 74 Q 65 82, 78 74"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Small dot accent */}
        <circle cx="72" cy="50" r="4" fill="white" opacity="0.8" />
      </svg>

      {/* Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: textSize,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: variant === 'header'
              ? 'none'
              : `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            WebkitBackgroundClip: variant === 'header' ? 'unset' : 'text',
            WebkitTextFillColor: variant === 'header' ? 'white' : 'transparent',
            backgroundClip: variant === 'header' ? 'unset' : 'text',
            color: variant === 'header' ? 'white' : 'transparent',
          }}>
            SRPay
          </span>
          {variant !== 'header' && variant !== 'admin' && (
            <span style={{
              fontSize: textSize * 0.45,
              fontWeight: 600,
              color: '#9CA3AF',
              letterSpacing: '1px',
              marginTop: -2,
            }}>
              DIGITAL PAYMENTS
            </span>
          )}
        </div>
      )}
    </div>
  );
}