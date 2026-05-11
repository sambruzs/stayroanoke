import React from 'react'
import styles from './PriceComparison.module.css'

const PLATFORMS = [
  { key: 'airbnb',  name: 'Airbnb',       fee: 0.10, feeLabel: '+10% service fee' },
  { key: 'vrbo',    name: 'VRBO',          fee: 0.08, feeLabel: '+8% service fee'  },
  { key: 'booking', name: 'Booking.com',   fee: 0.15, feeLabel: '+15% service fee' },
]

function PlatformIcon({ platform }) {
  if (platform === 'airbnb') {
    // Airbnb bélo: arch with circular cutout (top) + spreading wings (bottom)
    return (
      <div className={styles.logoBox} style={{ background: '#FF385C' }}>
        <svg viewBox="0 0 24 24" fill="white" width="21" height="21" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          <path d="M17.66 13.28A6.02 6.02 0 0015 12.28L12 15l-3-2.72a6.02 6.02 0 00-2.66 1 5.97 5.97 0 00-2.23 7.44A5.99 5.99 0 0010.28 24h.03l1.69-.97 1.69.97h.03a5.99 5.99 0 006.17-3.28 5.97 5.97 0 00-2.23-7.44z"/>
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
