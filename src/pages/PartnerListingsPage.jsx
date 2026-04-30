import React from 'react'
import { Link } from 'react-router-dom'
import { partnerListings } from '../data/partnerListings'
import styles from './PartnerListingsPage.module.css'

const PLATFORM_LABELS = {
  airbnb: { label: 'Airbnb', color: '#FF5A5F' },
  vrbo: { label: 'VRBO', color: '#3D67FF' },
}

export default function PartnerListingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Roanoke & Salem, Virginia</p>
        <h1 className={styles.title}>Partner Listings</h1>
        <p className={styles.subtitle}>
          More great stays in the Roanoke area, handpicked and bookable through Airbnb and VRBO.
        </p>
      </div>

      <div className={styles.inner}>
        <div className={styles.grid}>
          {partnerListings.map(listing => (
            <Link
              key={listing.id}
              to={`/partners/${listing.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                <img src={listing.photos[0]} alt={listing.title} loading="lazy" />
                <span
                  className={styles.platformBadge}
                  style={{ background: PLATFORM_LABELS[listing.platform].color }}
                >
                  {PLATFORM_LABELS[listing.platform].label}
                </span>
                {listing.tags?.[0] && (
                  <span className={styles.tag}>{listing.tags[0]}</span>
                )}
              </div>
              <div className={styles.body}>
                <div className={styles.topRow}>
                  <span className={styles.location}>{listing.location}</span>
                  <span className={styles.rating}>★ {listing.rating}</span>
                </div>
                <h2 className={styles.cardTitle}>{listing.title}</h2>
                <p className={styles.meta}>
                  {listing.bedrooms} bed · {listing.bathrooms} bath · Up to {listing.guests} guests
                </p>
                <p className={styles.excerpt}>{listing.excerpt}</p>
                <div className={styles.footer}>
                  <span className={styles.reviews}>{listing.reviews} reviews</span>
                  <span className={styles.viewLink}>View details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.notice}>
          <p>
            These properties are managed independently and booked through Airbnb or VRBO.
            For properties managed directly by Stay Roanoke, <Link to="/search">browse our full collection</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
