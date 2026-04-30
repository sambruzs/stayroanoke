import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { partnerListings } from '../data/partnerListings'
import styles from './PartnerDetailPage.module.css'

const PLATFORM_LABELS = {
  airbnb: { label: 'Airbnb', color: '#FF5A5F' },
  vrbo: { label: 'VRBO', color: '#3D67FF' },
}

const AMENITY_ICONS = {
  'Kitchen': '🍳', 'WiFi': '📶', 'Free Parking': '🚗', 'Pet Friendly': '🐾',
  'Washer': '🧺', 'Washer/Dryer': '🧺', 'TV': '📺', 'Air Conditioning': '❄️',
  'Deck/Patio': '🪟', 'Deck or patio': '🪟', 'Fenced Backyard': '🌿',
  'Pool Table': '🎱', 'Mountain View': '🏔️', 'City Skyline View': '🌆',
  'Free WiFi': '📶', 'Porch': '🪑', 'Porch or lanai': '🪑',
}

export default function PartnerDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const listing = partnerListings.find(l => l.slug === slug)
  const [photoIndex, setPhotoIndex] = useState(0)

  if (!listing) {
    navigate('/partners')
    return null
  }

  const platform = PLATFORM_LABELS[listing.platform]

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/partners" className={styles.back}>← Partner Listings</Link>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            <img src={listing.photos[photoIndex]} alt={listing.title} />
          </div>
          {listing.photos.length > 1 && (
            <div className={styles.thumbs}>
              {listing.photos.map((p, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === photoIndex ? styles.activeThumb : ''}`}
                  onClick={() => setPhotoIndex(i)}
                >
                  <img src={p} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.content}>
          {/* Details */}
          <div className={styles.details}>
            <p className={styles.location}>{listing.location}</p>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.meta}>
              {listing.type} · {listing.bedrooms} bed · {listing.bathrooms} bath · Up to {listing.guests} guests
            </p>
            <div className={styles.ratingRow}>
              <span className={styles.rating}>★ {listing.rating}</span>
              <span className={styles.reviews}>· {listing.reviews} reviews</span>
              <span
                className={styles.platformTag}
                style={{ background: platform.color }}
              >
                {platform.label}
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.description}>
              <h2>About this property</h2>
              <p>{listing.description}</p>
            </div>

            {listing.amenities.length > 0 && (
              <>
                <div className={styles.divider} />
                <div className={styles.amenities}>
                  <h2>Amenities</h2>
                  <div className={styles.amenityGrid}>
                    {listing.amenities.map(a => (
                      <div key={a} className={styles.amenity}>
                        <span>{AMENITY_ICONS[a] || '✓'}</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking panel */}
          <aside className={styles.panel}>
            <div className={styles.panelInner}>
              <div className={styles.panelRating}>
                ★ {listing.rating} · <span>{listing.reviews} reviews</span>
              </div>

              <p className={styles.panelNote}>
                This property is listed on {platform.label}. Click below to check availability and book directly.
              </p>

              <a
                href={listing.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.bookBtn}
                style={{ background: platform.color }}
              >
                Book Now on {platform.label} →
              </a>

              <p className={styles.panelDisclaimer}>
                You will be redirected to {platform.label} to complete your booking. Stay Roanoke is not responsible for transactions made on third-party platforms.
              </p>

              <div className={styles.divider} />

              <div className={styles.panelAlt}>
                <p>Looking for properties managed directly by Stay Roanoke?</p>
                <Link to="/search" className={styles.altLink}>Browse our full collection →</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
