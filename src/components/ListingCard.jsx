import React from 'react'
import { Link } from 'react-router-dom'
import styles from './ListingCard.module.css'

function StarRating({ rating }) {
  return (
    <span className={styles.stars}>
      ★ {rating?.toFixed(1)}
    </span>
  )
}

export default function ListingCard({ listing, searchParams }) {
  const photo = listing.pictures?.[0]?.thumbnail || listing.pictures?.[0]?.original || 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'
  const price = listing.prices?.basePrice || listing.price?.basePrice || 0
  const rating = listing.reviewsStats?.avgRating
  const reviewCount = listing.reviewsStats?.numberOfReviews

  const query = searchParams ? `?${searchParams}` : ''

  return (
    <Link to={`/listing/${listing._id || listing.id}${query}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={photo} alt={listing.title} className={styles.image} loading="lazy" />
        {listing.tags?.length > 0 && (
          <div className={styles.badge}>{listing.tags[0]}</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.location}>
            {listing.address?.city || 'Roanoke'}, VA
          </span>
          {rating && <StarRating rating={rating} />}
        </div>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.meta}>
          {listing.bedrooms} bed · {listing.bathrooms} bath · Up to {listing.accommodates} guests
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>
            <strong>${price}</strong> / night
          </span>
          {reviewCount && (
            <span className={styles.reviews}>{reviewCount} reviews</span>
          )}
        </div>
      </div>
    </Link>
  )
}
