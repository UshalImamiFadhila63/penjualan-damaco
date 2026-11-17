import React from 'react';

const DamacoLogo = ({ size = 'medium', className = '' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  const iconSize = isSmall ? 28 : isLarge ? 42 : 34;
  const textSize = isSmall ? 18 : isLarge ? 26 : 22;

  return (
    <div className={`damaco-brand-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Oval / Pill Gradient Badge */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="damacoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="48%" stopColor="#3B82F6" />
            <stop offset="52%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Outer Oval */}
        <circle cx="50" cy="50" r="46" fill="url(#damacoGrad)" filter="url(#softGlow)" />
        {/* Subtle inner reflection ring */}
        <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        {/* White Stylized Serif Letter D */}
        <text
          x="49"
          y="66"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="48"
          fontWeight="700"
          fontStyle="italic"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          D
        </text>
      </svg>

      {/* Serif Wordmark */}
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: textSize,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#0F172A',
          lineHeight: 1,
        }}
      >
        Damaco
      </span>
    </div>
  );
};

export default DamacoLogo;

