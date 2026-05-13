import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { differenceInCalendarDays, addDays, format } from 'date-fns'
import styles from './ConfirmationPage.module.css'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const { listing, checkIn, checkOut, guests, guest } = state || {}

  const daysUntilCheckIn = checkIn
    ? differenceInCalendarDays(new Date(checkIn), new Date())
    : null
  const chargeWithin10Days = daysUntilCheckIn !== null && daysUntilCheckIn <= 10
  const chargeDate = checkIn
    ? format(addDays(new Date(checkIn), -10), 'MMMM d, yyyy')
    : null

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Booking Confirmed!</h1>
        <p className={styles.subtitle}>
          Thank you, {guest?.firstName}! Your reservation is confirmed and a summary has been sent to <strong>{guest?.email}</strong>.
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
          <h3>Payment &amp; Cancellation</h3>
          <ol>
            {chargeWithin10Days
              ? <li>Your card has been charged in full, as your arrival is within 10 days.</li>
              : <li>Your card will be charged in full on <strong>{chargeDate}</strong> (10 days before arrival).</li>
            }
            <li>A detailed confirmation with check-in instructions will be sent to your email.</li>
            <li>Questions? Email <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> or call <a href="tel:+15407327151">(540) 732-7151</a>.</li>
          </ol>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>Back to Home</Link>
          <Link to="/search" className={styles.browseBtn}>Browse More Properties</Link>
        </div>

        <p className={styles.contact}>
          Questions? Email us at <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> or call <a href="tel:+15407327151">(540) 732-7151</a>
        </p>
      </div>
    </div>
  )
}
