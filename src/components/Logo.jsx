import React from 'react'

export function StayRoanokeMark({ style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Stay Roanoke mark" style={{ display: 'block', ...style }}>
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
      <polygon points="32,15 36.41,26.93 49.12,27.44 39.13,35.32 42.58,47.56 32,40.50 21.42,47.56 24.87,35.32 14.88,27.44 27.59,26.93" fill="currentColor" />
      <line x1="6" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="33" r="3" fill="#ffb84d" />
    </svg>
  )
}

export function StayRoanokeLogo({ markSize = 48, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', lineHeight: 1, color: 'inherit', ...style }}>
      <StayRoanokeMark style={{ width: markSize, height: markSize, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '9px',
          fontWeight: 400,
          letterSpacing: '0.22em',
          opacity: 0.65,
          textTransform: 'uppercase',
          color: 'currentColor',
        }}>
          EST 2021 · STAR CITY · VA
        </span>
        <span style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: 'currentColor',
          lineHeight: 1,
        }}>
          STAY ROANOKE
        </span>
      </div>
    </div>
  )
}
