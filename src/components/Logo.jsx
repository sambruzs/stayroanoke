import React from 'react'

export function StayRoanokeLogo({ style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" role="img" aria-label="Stay Roanoke" style={{ display: 'block', ...style }}>
      <g transform="translate(8 8)">
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
        <polygon points="32,15 34.65,23.16 43.23,23.16 36.29,28.18 38.94,36.34 32,31.32 25.06,36.34 27.71,28.18 20.77,23.16 29.35,23.16" fill="currentColor" />
        <line x1="6" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="32" cy="33" r="3" fill="#ffb84d" />
      </g>
      <g transform="translate(88 22)" fill="currentColor">
        <text x="0" y="0" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="9" letterSpacing="3" opacity="0.7">EST 2021 · STAR CITY · VA</text>
        <text x="0" y="30" fontFamily="'Space Grotesk', system-ui, sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.3">STAY ROANOKE</text>
      </g>
    </svg>
  )
}

export function StayRoanokeMark({ style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Stay Roanoke" style={{ display: 'block', ...style }}>
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
      <polygon points="32,15 34.65,23.16 43.23,23.16 36.29,28.18 38.94,36.34 32,31.32 25.06,36.34 27.71,28.18 20.77,23.16 29.35,23.16" fill="currentColor" />
      <line x1="6" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="33" r="3" fill="#ffb84d" />
    </svg>
  )
}
