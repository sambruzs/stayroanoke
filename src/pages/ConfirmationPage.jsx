import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from './ConfirmationPage.module.css'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const { listing, checkIn, checkOut, guests, guest } = state || {}

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Booking Request Sent!</h1>
        <p className={styles.subtitle}>
          Thank you, {guest?.firstName}! Your reservation request has been received.
          We'll confirm your booking within 24 hours at <strong>{guest?.email}</strong>.
        </p>

        {listing && (
          <div className={styles.summary}>
            <img
              src={listing.pictures?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80'}
              alt={listing.title}
              className={styles.photo}
            />
            <div className={styles.summaryText}>
              <h2>{listing.title}</h2>
              <p>{checkIn} → {checkOut}</p>
              <p>{guests} guest{parseInt(guests) > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        <div className={styles.nextSteps}>
          <h3>What happens next?</h3>
          <ol>
            <li>We'll review your request and confirm availability</li>
            <li>You'll receive a confirmation email with payment details</li>
            <li>Once payment is complete, your stay is officially booked!</li>
          </ol>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>Back to Home</Link>
          <Link to="/search" className={styles.browseBtn}>Browse More Properties</Link>
        </div>

        <p className={styles.contact}>
          Questions? Email us at <a href="mailto:hello@stayroanoke.com">hello@stayroanoke.com</a> or call <a href="tel:+15401234567">(540) 123-4567</a>
        </p>
      </div>
    </div>
  )
}
