import React from 'react'
import styles from './PriceComparison.module.css'

const PLATFORMS = [
  { key: 'airbnb',  name: 'Airbnb',       fee: 0.10, feeLabel: '+10% service fee' },
  { key: 'vrbo',    name: 'VRBO',          fee: 0.08, feeLabel: '+8% service fee'  },
  { key: 'booking', name: 'Booking.com',   fee: 0.15, feeLabel: '+15% service fee' },
]

function PlatformIcon({ platform }) {
  if (platform === 'airbnb') {
    return (
      <div className={styles.logoBox} style={{ background: '#FF385C' }}>
        {/* Airbnb bélo mark */}
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5c-2.76 0-5 2.35-5 5.25 0 1.8.9 3.47 2.38 4.5L12 13l2.62-1.75C16.1 10.22 17 8.55 17 6.75c0-2.9-2.24-5.25-5-5.25zm0 3c1.1 0 2 .95 2 2.12s-.9 2.13-2 2.13-2-.96-2-2.13.9-2.12 2-2.12z"/>
          <path d="M18.46 14.06c-.74-1.47-2-2.48-3.46-2.8L12 13.8l-3 -2.54c-1.46.32-2.72 1.33-3.46 2.8-1.42 2.74-.28 6.14 2.42 7.74 1.22.72 2.58.64 3.66.18l.38-.17.38.17c.42.18.85.26 1.28.26.64 0 1.28-.18 1.86-.44 2.7-1.6 3.84-5 2.42-7.74z"/>
        </svg>
      </div>
    )
  }
  if (platform === 'vrbo') {
    return (
      <div className={styles.logoBox} style={{ background: '#1C69D4' }}>
        <svg viewBox="0 0 40 18" fill="white" width="28" height="13" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="14" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">vrbo</text>
        </svg>
      </div>
    )
  }
  if (platform === 'booking') {
    return (
      <div className={styles.logoBox} style={{ background: '#003580' }}>
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <text x="2" y="18" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16">B.</text>
        </svg>
      </div>
    )
  }
  return null
}

export default function PriceComparison({ quote, onBookDirect }) {
  if (!quote || quote.mock) return null

  const directTotal = quote.total
  const maxPlatformTotal = Math.ceil(directTotal * (1 + Math.max(...PLATFORMS.map(p => p.fee))))
  const savings = maxPlatformTotal - Math.round(directTotal)

  return (
    <div className={styles.widget}>
      <p className={styles.heading}>Why book direct?</p>

      {/* Direct row */}
      <div className={`${styles.row} ${styles.directRow}`}>
        <div className={styles.iconWrap}>
          <div className={`${styles.icon} ${styles.directIcon}`}>SR</div>
        </div>
        <div className={styles.info}>
          <span className={styles.platformName}>Book Direct (this site)</span>
          <span className={styles.feeLabel}>No booking fees</span>
        </div>
        <div className={styles.priceWrap}>
          <span className={styles.directPrice}>${Math.round(directTotal)}</span>
          {savings > 0 && (
            <span className={styles.saveBadge}>SAVE ${savings}</span>
          )}
        </div>
      </div>

      {/* Platform rows */}
      {PLATFORMS.map(p => {
        const platformTotal = Math.ceil(directTotal * (1 + p.fee))
        return (
          <div key={p.key} className={styles.row}>
            <div className={styles.iconWrap}>
              <PlatformIcon platform={p.key} />
            </div>
            <div className={styles.info}>
              <span className={styles.platformName}>{p.name}</span>
              <span className={styles.feeLabel}>{p.feeLabel}</span>
            </div>
            <div className={styles.priceWrap}>
              <span className={styles.platformPrice}>${platformTotal}</span>
            </div>
          </div>
        )
      })}

      <p className={styles.disclaimer}>Platform prices are estimates based on published service fees.</p>
    </div>
  )
}
