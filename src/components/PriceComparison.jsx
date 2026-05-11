import React from 'react'
import styles from './PriceComparison.module.css'

const PLATFORMS = [
  {
    key: 'airbnb',
    name: 'Airbnb',
    fee: 0.10,
    feeLabel: '+10% service fee',
    logo: 'https://logo.clearbit.com/airbnb.com',
  },
  {
    key: 'vrbo',
    name: 'VRBO',
    fee: 0.08,
    feeLabel: '+8% service fee',
    logo: 'https://logo.clearbit.com/vrbo.com',
  },
  {
    key: 'booking',
    name: 'Booking.com',
    fee: 0.15,
    feeLabel: '+15% service fee',
    logo: 'https://logo.clearbit.com/booking.com',
  },
]

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
              <div className={styles.logoBox}>
                <img src={p.logo} alt={p.name} className={styles.logoImg} />
              </div>
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
