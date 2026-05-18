import React from 'react'
import { Link } from 'react-router-dom'
import styles from './ListingCard.module.css'
import { getCardImage } from '../utils/imageUtils'

export default function ListingCard({ listing, searchParams }) {
  const rawPhoto = listing.pictures?.[0]?.original ||
    listing.pictures?.[0]?.thumbnail ||
    listing.picture?.original ||
    listing.picture?.thumbnail ||
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'

  const photo = getCardImage(rawPhoto)

  const price = listing.prices?.basePrice ||
    listing.price?.basePrice ||
    listing.prices?.nightlyRate ||
    0

  const r = listing.reviewsStats || listing.reviewStats || listing.reviews?.stats || listing.reviews?.summary || listing.reviews || {}
  const rating = r?.avgRating ?? r?.averageRating ?? r?.avg ?? r?.score ?? listing.avgRating ?? listing.rating
  const reviewCount = r?.numberOfReviews ?? r?.count ?? r?.total ?? r?.numReviews ?? listing.reviewCount
  const badge = listing.propertyType || listing.type || null
  const query = searchParams ? `?${searchParams}` : ''

  return (
    <Link to={`/listing/${listing._id || listing.id}${query}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={photo} alt={listing.title} className={styles.image} loading="lazy" />
        {badge && (
          <div className={styles.badge}>{badge}</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.location}>
            {listing.address?.city || 'Roanoke'}, {listing.address?.state || 'VA'}
          </span>
          {rating > 0 && <span className={styles.stars}>★ {rating.toFixed(1)}</span>}
        </div>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.meta}>
          {listing.bedrooms} bed · {listing.bathrooms} bath · Up to {listing.accommodates} guests
        </p>
        <div className={styles.footer}>
          {price > 0 ? (
            <span className={styles.price}>
              <strong>${price}</strong> / night
            </span>
          ) : (
            <span className={styles.price}>Contact for pricing</span>
          )}
          {rating > 0 && (
            <span className={styles.reviews}>
              ★ {rating.toFixed(1)}{reviewCount > 0 ? ` · ${reviewCount}` : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
