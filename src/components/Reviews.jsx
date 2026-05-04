import React from 'react'
import styles from './Reviews.module.css'

function StarRow({ label, score }) {
  if (!score) return null
  const pct = Math.round((score / 10) * 100)
  return (
    <div className={styles.starRow}>
      <span className={styles.starLabel}>{label}</span>
      <div className={styles.starBar}>
        <div className={styles.starFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.starScore}>{(score / 2).toFixed(1)}</span>
    </div>
  )
}

const FIRST_NAMES = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Chris', 'Ashley', 'Matthew', 'Amanda', 'Daniel', 'Stephanie', 'Andrew', 'Jennifer', 'Josh', 'Megan', 'Ryan', 'Lauren', 'Tyler', 'Rachel', 'Kevin', 'Nicole', 'Brian', 'Brittany', 'John', 'Samantha', 'Eric', 'Chelsea', 'Mark', 'Amber']
const LAST_INITIALS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W']

function getFakeName(seed) {
  // Generate consistent name from any string seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const abs = Math.abs(hash)
  const first = FIRST_NAMES[abs % FIRST_NAMES.length]
  const last = LAST_INITIALS[(abs >> 4) % LAST_INITIALS.length]
  return `${first} ${last}.`
}

function ReviewCard({ review }) {
  const raw = review.rawReview || {}

  const reviewer = getFakeName(review._id || review.guestId || 'guest')

  const text = raw.public_review || raw.comments || ''

  const rating = raw.overall_rating

  const date = review.createdAt || raw.submitted_at

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : ''

  const channel = review.channelId === 'airbnb2' ? 'Airbnb' :
    review.channelId === 'bookingCom' ? 'Booking.com' :
    review.channelId || ''

  if (!text) return null

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.avatar}>
          {reviewer.charAt(0).toUpperCase()}
        </div>
        <div className={styles.reviewMeta}>
          <p className={styles.reviewerName}>{reviewer}</p>
          <p className={styles.reviewDate}>{formattedDate}</p>
        </div>
        {rating && (
          <div className={styles.reviewRating}>
            ★ {typeof rating === 'number' ? (rating > 5 ? (rating / 2).toFixed(1) : rating.toFixed(1)) : rating}
          </div>
        )}
      </div>
      <p className={styles.reviewText}>{text}</p>
      {channel && (
        <span className={styles.reviewChannel}>via {channel}</span>
      )}
    </div>
  )
}

export default function Reviews({ reviews, stats, loading }) {
  if (loading) return (
    <div className={styles.loading}>Loading reviews...</div>
  )

  if (!reviews?.length && !stats) return null

  const avgRating = stats?.avgRating || stats?.averageRating
  const totalReviews = stats?.numberOfReviews || stats?.totalReviews || reviews?.length

  return (
    <div className={styles.reviews}>
      {/* Summary */}
      {avgRating && (
        <div className={styles.summary}>
          <div className={styles.summaryScore}>
            <span className={styles.bigStar}>★</span>
            <span className={styles.bigRating}>{avgRating.toFixed(2)}</span>
            <span className={styles.totalReviews}>· {totalReviews} reviews</span>
          </div>

          {/* Category scores if available */}
          {stats?.categoriesAverages && (
            <div className={styles.categories}>
              <StarRow label="Cleanliness" score={stats.categoriesAverages.cleanliness} />
              <StarRow label="Accuracy" score={stats.categoriesAverages.accuracy} />
              <StarRow label="Communication" score={stats.categoriesAverages.communication} />
              <StarRow label="Location" score={stats.categoriesAverages.location} />
              <StarRow label="Check-in" score={stats.categoriesAverages.checkIn} />
              <StarRow label="Value" score={stats.categoriesAverages.value} />
            </div>
          )}
        </div>
      )}

      {/* Individual reviews */}
      {reviews?.length > 0 && (
        <div className={styles.reviewGrid}>
          {reviews.map((review, i) => (
            <ReviewCard key={review._id || review.id || i} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
