/**
 * VyaparSetu Official Brand Logo
 * 
 * Symbolism:
 * - Geometric architectural bridge ("Setu") spanning two trading nodes ("Vyapar").
 * - Left pillar represents buyers & local procurement demand.
 * - Right pillar represents verified local shopkeepers & inventory.
 * - The dynamic central arch and exchange diamond represent direct trade & quotations.
 * - Colors: Deep Navy (#0f172a), Vibrant Trade Saffron / Warm Amber (#f59e0b / #d97706),
 *   and Electric Blue / Cyan (#2563eb / #0284c7) reflecting Indian enterprise & trust.
 */
export default function Logo({
  variant = 'simple', // 'simple' | 'full' | 'icon' | 'stacked'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  theme = 'auto',     // 'auto' | 'dark' | 'light'
  className = '',
  showTagline = true,
}) {
  // Size mappings (height in pixels)
  const sizeMap = {
    sm: { iconSize: 26, fontSize: '1.05rem', subSize: '0.6rem', gap: '8px' },
    md: { iconSize: 34, fontSize: '1.35rem', subSize: '0.68rem', gap: '10px' },
    lg: { iconSize: 44, fontSize: '1.75rem', subSize: '0.78rem', gap: '12px' },
    xl: { iconSize: 64, fontSize: '2.4rem', subSize: '0.95rem', gap: '16px' },
  };

  const currentSize = typeof size === 'string' ? sizeMap[size] || sizeMap.md : {
    iconSize: size,
    fontSize: `${size * 0.45}px`,
    subSize: `${size * 0.22}px`,
    gap: `${size * 0.28}px`,
  };

  const isLight = theme === 'light';
  const textColor = isLight ? '#0f172a' : '#0f172a';
  const subtextColor = isLight ? '#64748b' : '#64748b';

  // SVG Icon component
  const LogoIcon = ({ size: iconPx = 34 }) => (
    <svg
      width={iconPx}
      height={iconPx}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="vyaparsetu-logo-mark"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        {/* Navy to Indigo gradient */}
        <linearGradient id="vsNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Trade Amber / Saffron gradient */}
        <linearGradient id="vsAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Bridge Arch gradient */}
        <linearGradient id="vsBridgeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id="vsShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Hexagonal Shield Background for Trust & Reliability */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#vsNavyGrad)"
        filter="url(#vsShadow)"
      />

      {/* Subtle geometric pattern outline inside badge */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Left Pillar: Bulk Buyer / Construction Node */}
      <path
        d="M14 45V29C14 27.8954 14.8954 27 16 27H22C23.1046 27 24 27.8954 24 29V45H14Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Left Pillar Architectural accents */}
      <rect x="17" y="31" width="4" height="3" rx="0.8" fill="#1E3A8A" />
      <rect x="17" y="37" width="4" height="3" rx="0.8" fill="#1E3A8A" />

      {/* Right Pillar: Local Shopkeeper / Supplier Storefront */}
      <path
        d="M40 45V25C40 23.8954 40.8954 23 42 23H48C49.1046 23 50 23.8954 50 25V45H40Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Right Pillar Store accents */}
      <rect x="43" y="27" width="4" height="3" rx="0.8" fill="#1E3A8A" />
      <rect x="43" y="33" width="4" height="3" rx="0.8" fill="#1E3A8A" />
      <rect x="43" y="39" width="4" height="3" rx="0.8" fill="#1E3A8A" />

      {/* The Setu (Bridge Arch): Dynamic suspension bridge connecting the trade partners */}
      <path
        d="M16 27C21 16 43 14 48 23"
        stroke="url(#vsBridgeGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Bridge Roadway Deck */}
      <path
        d="M13 32H51"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />

      {/* Dynamic Quotation Exchange Emblem (Center Amber Diamond) */}
      <path
        d="M32 16L38 23L32 30L26 23L32 16Z"
        fill="url(#vsAmberGrad)"
        filter="url(#vsShadow)"
      />
      <circle cx="32" cy="23" r="2.2" fill="#FFFFFF" />

      {/* Foundation Base line */}
      <path
        d="M10 47H54"
        stroke="url(#vsAmberGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`vyaparsetu-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <LogoIcon size={currentSize.iconSize} />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`vyaparsetu-logo vyaparsetu-logo-stacked ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
        }}
      >
        <LogoIcon size={currentSize.iconSize * 1.3} />
        <div>
          <div
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <span style={{ color: '#0f172a' }}>Vyapar</span>
            <span style={{ color: '#d97706' }}>Setu</span>
          </div>
          {showTagline && (
            <div
              style={{
                fontSize: currentSize.subSize,
                fontWeight: 600,
                color: subtextColor,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              Local B2B Procurement
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default: 'simple' or 'full')
  return (
    <div
      className={`vyaparsetu-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <LogoIcon size={currentSize.iconSize} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: currentSize.fontSize,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span style={{ color: '#0f172a' }}>Vyapar</span>
          <span style={{ color: '#d97706' }}>Setu</span>
        </div>
        {(variant === 'full' || (showTagline && (size === 'lg' || size === 'xl'))) && (
          <span
            style={{
              fontSize: currentSize.subSize,
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Local Procurement Network
          </span>
        )}
      </div>
    </div>
  );
}
