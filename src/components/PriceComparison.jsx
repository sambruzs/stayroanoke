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
      <div className={styles.logoBox} style={{ background: '#fff', border: '1px solid #eee' }}>
        <svg viewBox="0 0 24 24" fill="#FF5A5F" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5c-1.5 0-2.7 1.4-2.7 3.1 0 1.1.5 2.1 1.4 2.8L12 9.6l1.3-1.2c.9-.7 1.4-1.7 1.4-2.8C14.7 3.9 13.5 2.5 12 2.5z"/>
          <path d="M17.4 13.4c-.5-1-1.4-1.7-2.5-2l-.5.5L12 13.8l-2.4-1.9-.5-.5c-1.1.3-2 1-2.5 2C5.4 15.8 6.3 18.5 8.3 19.8c.8.5 1.7.5 2.5.2l1.2-.6 1.2.6c.4.2.8.2 1.2.2.5 0 1-.1 1.4-.4 2-1.3 2.9-4 1.6-6.4z"/>
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
