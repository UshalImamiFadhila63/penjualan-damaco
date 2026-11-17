import React from 'react';

const DroneSvgIllustration = ({
  type = 'quadcopter',
  angle = 'depan', // 'depan' | 'samping' | 'atas'
  height = 200,
  className = '',
}) => {
  return (
    <div
      className={`drone-illustration-container ${className}`}
      style={{
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 500 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: height,
          filter: 'drop-shadow(0 12px 24px rgba(24, 37, 31, 0.08))',
        }}
      >
        <defs>
          {/* Pedestal Glow & Gradients in Green Theme */}
          <radialGradient id={`padGlow-${type}-${angle}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#286845" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#E8F1E9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F7F8F5" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`pedestalSurface-${type}-${angle}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E1E7E1" />
          </linearGradient>

          <linearGradient id={`droneBodyGrad-${type}-${angle}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3A34" />
            <stop offset="100%" stopColor="#18251F" />
          </linearGradient>

          <linearGradient id={`propellerBlur-${type}-${angle}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6B776F" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#286845" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6B776F" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id={`batteryGrad-${type}-${angle}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A3B32" />
            <stop offset="100%" stopColor="#15211B" />
          </linearGradient>
        </defs>

        {/* ── 1. Circular Launchpad Pedestal ────────────────────── */}
        <ellipse cx="250" cy="245" rx="150" ry="42" fill={`url(#padGlow-${type}-${angle})`} />
        <ellipse cx="250" cy="244" rx="120" ry="32" fill="#D3DED4" />
        <path d="M 130 244 A 120 32 0 0 0 370 244 L 370 252 A 120 32 0 0 1 130 252 Z" fill="#BCCAC0" />
        <ellipse cx="250" cy="240" rx="118" ry="30" fill={`url(#pedestalSurface-${type}-${angle})`} stroke="#E1E7E1" strokeWidth="2" />
        <ellipse cx="250" cy="240" rx="90" ry="22" stroke="#286845" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="6 4" fill="none" />
        <ellipse cx="250" cy="240" rx="60" ry="14" stroke="#286845" strokeOpacity="0.5" strokeWidth="1.5" fill="rgba(232, 241, 233, 0.5)" />
        <text
          x="250"
          y="245"
          fill="#286845"
          fontSize="15"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          opacity="0.8"
        >
          H
        </text>

        {/* ── 2. Type: BATERAI ─────────────────────────────────── */}
        {type === 'baterai' && (
          <g transform="translate(0, -10)">
            {/* Battery shadow on pedestal */}
            <ellipse cx="250" cy="235" rx="70" ry="14" fill="#18251F" opacity="0.3" />

            {/* Battery Main Body Box */}
            <rect x="180" y="140" width="140" height="75" rx="14" fill={`url(#batteryGrad-${type}-${angle})`} stroke="#3D5045" strokeWidth="2.5" />
            
            {/* Battery Top Handle / Terminal */}
            <rect x="220" y="128" width="60" height="15" rx="5" fill="#18251F" stroke="#3D5045" strokeWidth="1.5" />
            <rect x="320" y="160" width="12" height="35" rx="3" fill="#D1D5DB" />

            {/* Red Accent Stripe & Status LEDs */}
            <rect x="200" y="152" width="100" height="6" rx="3" fill="#DC2626" />
            <circle cx="215" cy="180" r="4" fill="#286845" />
            <circle cx="230" cy="180" r="4" fill="#286845" />
            <circle cx="245" cy="180" r="4" fill="#286845" />
            <circle cx="260" cy="180" r="4" fill="#286845" />
            <circle cx="295" cy="180" r="6" fill="#1E2A24" stroke="#4B5563" strokeWidth="1.5" />

            {/* Grip Ridges */}
            <line x1="200" y1="195" x2="280" y2="195" stroke="#3D5045" strokeWidth="2" strokeLinecap="round" />
            <line x1="200" y1="202" x2="280" y2="202" stroke="#3D5045" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* ── 3. Type: PROPELLER ───────────────────────────────── */}
        {type === 'propeller' && (
          <g transform="translate(0, -10)">
            {/* Shadow */}
            <ellipse cx="250" cy="235" rx="75" ry="12" fill="#18251F" opacity="0.25" />

            {/* Blade 1 (Upper Left-Right Aerodynamic Wing) */}
            <path
              d="M 160 145 C 200 135 240 148 250 152 C 260 156 300 135 340 145 C 320 165 280 162 250 155 C 220 148 180 165 160 145 Z"
              fill={`url(#batteryGrad-${type}-${angle})`}
              stroke="#3D5045"
              strokeWidth="2"
            />
            {/* Blade 2 (Lower Wing with angle) */}
            <path
              d="M 170 170 C 210 160 240 168 250 172 C 260 176 290 160 330 170 C 310 190 280 182 250 175 C 220 168 190 190 170 170 Z"
              fill="#26352E"
              stroke="#3D5045"
              strokeWidth="2"
            />

            {/* Central Hub / Ring */}
            <circle cx="250" cy="153" r="14" fill="#18251F" stroke="#6B776F" strokeWidth="2" />
            <circle cx="250" cy="153" r="7" fill="#FFFFFF" />

            {/* Accent Tips (Orange/Red & Blue) */}
            <circle cx="165" cy="147" r="4" fill="#2563EB" />
            <circle cx="335" cy="147" r="4" fill="#DC2626" />
          </g>
        )}

        {/* ── 4. Type: QUADCOPTER (3 Angle Views) ──────────────── */}
        {type === 'quadcopter' && angle === 'depan' && (
          <g>
            {/* Drone Shadow on Pad */}
            <ellipse cx="250" cy="238" rx="42" ry="10" fill="#18251F" opacity="0.25" />

            {/* Drone Arms & Motors */}
            <path d="M 230 145 L 160 115" stroke="#1E2A24" strokeWidth="7" strokeLinecap="round" />
            <path d="M 270 145 L 340 115" stroke="#1E2A24" strokeWidth="7" strokeLinecap="round" />
            <path d="M 225 155 L 140 185" stroke="#26352E" strokeWidth="8" strokeLinecap="round" />
            <path d="M 275 155 L 360 185" stroke="#26352E" strokeWidth="8" strokeLinecap="round" />

            {/* Landing Struts / Legs */}
            <path d="M 225 165 L 215 210 L 195 212" stroke="#2D3A34" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 275 165 L 285 210 L 305 212" stroke="#2D3A34" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Propeller Discs */}
            <ellipse cx="160" cy="115" rx="46" ry="11" fill={`url(#propellerBlur-${type}-${angle})`} />
            <ellipse cx="160" cy="115" rx="8" ry="4" fill="#18251F" />
            <circle cx="160" cy="113" r="4" fill="#6B776F" />

            <ellipse cx="340" cy="115" rx="46" ry="11" fill={`url(#propellerBlur-${type}-${angle})`} />
            <ellipse cx="340" cy="115" rx="8" ry="4" fill="#18251F" />
            <circle cx="340" cy="113" r="4" fill="#6B776F" />

            <ellipse cx="140" cy="185" rx="54" ry="13" fill={`url(#propellerBlur-${type}-${angle})`} />
            <ellipse cx="140" cy="185" rx="10" ry="5" fill="#18251F" />
            <path d="M 115 186 A 25 7 0 0 1 125 180" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

            <ellipse cx="360" cy="185" rx="54" ry="13" fill={`url(#propellerBlur-${type}-${angle})`} />
            <ellipse cx="360" cy="185" rx="10" ry="5" fill="#18251F" />
            <path d="M 375 186 A 25 7 0 0 0 385 180" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />

            {/* Fuselage / Central Drone Body */}
            <path
              d="M 222 135 C 222 120 278 120 278 135 L 284 165 C 284 175 272 182 250 182 C 228 182 216 175 216 165 Z"
              fill={`url(#droneBodyGrad-${type}-${angle})`}
              stroke="#3D5045"
              strokeWidth="1.5"
            />
            {/* Top Shell Accent in Vibrant Red Stripe */}
            <path d="M 228 130 C 235 125 265 125 272 130 L 274 135 C 265 131 235 131 226 135 Z" fill="#DC2626" />

            {/* RTK Dome Sensor on Top */}
            <ellipse cx="250" cy="120" rx="16" ry="6" fill="#1E2A24" stroke="#4B5563" strokeWidth="1" />
            <ellipse cx="250" cy="118" rx="8" ry="3" fill="#6B776F" />

            {/* Camera Gimbal Unit (Center Bottom) */}
            <circle cx="250" cy="192" r="14" fill="#0D1511" stroke="#3D5045" strokeWidth="2" />
            <circle cx="250" cy="192" r="8" fill="#18251F" stroke="#286845" strokeWidth="1.5" />
            <circle cx="250" cy="192" r="4" fill="#2563EB" opacity="0.9" />
            <circle cx="248" cy="190" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}

        {/* ── Angle: SAMPING (Side Profile) ────────────────────── */}
        {type === 'quadcopter' && angle === 'samping' && (
          <g>
            <ellipse cx="250" cy="238" rx="46" ry="10" fill="#18251F" opacity="0.25" />

            {/* Side Landing Gear */}
            <path d="M 230 165 L 220 212 L 180 214" stroke="#2D3A34" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 270 165 L 280 212 L 320 214" stroke="#2D3A34" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Side Arm Span */}
            <path d="M 180 145 L 320 145" stroke="#1E2A24" strokeWidth="8" strokeLinecap="round" />

            {/* Propellers */}
            <ellipse cx="170" cy="142" rx="48" ry="10" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="170" cy="140" r="5" fill="#6B776F" />
            <ellipse cx="330" cy="142" rx="48" ry="10" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="330" cy="140" r="5" fill="#6B776F" />

            {/* Side Aerodynamic Fuselage */}
            <path
              d="M 195 145 C 195 125 305 125 305 145 C 305 165 295 178 250 178 C 205 178 195 165 195 145 Z"
              fill={`url(#droneBodyGrad-${type}-${angle})`}
              stroke="#3D5045"
              strokeWidth="2"
            />
            {/* Top Red Stripe */}
            <path d="M 220 128 C 240 125 280 125 290 130" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />

            {/* Front Gimbal Camera looking forward */}
            <ellipse cx="190" cy="165" rx="12" ry="10" fill="#0D1511" stroke="#3D5045" strokeWidth="2" />
            <circle cx="186" cy="165" r="4" fill="#2563EB" />
          </g>
        )}

        {/* ── Angle: ATAS (Top-Down View) ──────────────────────── */}
        {type === 'quadcopter' && angle === 'atas' && (
          <g>
            <ellipse cx="250" cy="238" rx="35" ry="8" fill="#18251F" opacity="0.2" />

            {/* 4 Diagonal Arms forming X shape */}
            <line x1="180" y1="90" x2="320" y2="230" stroke="#1E2A24" strokeWidth="8" strokeLinecap="round" />
            <line x1="320" y1="90" x2="180" y2="230" stroke="#1E2A24" strokeWidth="8" strokeLinecap="round" />

            {/* 4 Circular Propeller Discs */}
            <ellipse cx="180" cy="90" rx="34" ry="24" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="180" cy="90" r="6" fill="#18251F" stroke="#6B776F" strokeWidth="1.5" />

            <ellipse cx="320" cy="90" rx="34" ry="24" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="320" cy="90" r="6" fill="#18251F" stroke="#6B776F" strokeWidth="1.5" />

            <ellipse cx="180" cy="230" rx="34" ry="24" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="180" cy="230" r="6" fill="#18251F" stroke="#6B776F" strokeWidth="1.5" />

            <ellipse cx="320" cy="230" rx="34" ry="24" fill={`url(#propellerBlur-${type}-${angle})`} />
            <circle cx="320" cy="230" r="6" fill="#18251F" stroke="#6B776F" strokeWidth="1.5" />

            {/* Center Body Dome */}
            <circle cx="250" cy="160" r="28" fill={`url(#droneBodyGrad-${type}-${angle})`} stroke="#3D5045" strokeWidth="2" />
            <circle cx="250" cy="160" r="14" fill="#18251F" stroke="#DC2626" strokeWidth="2" />
            <circle cx="250" cy="160" r="5" fill="#286845" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default DroneSvgIllustration;
