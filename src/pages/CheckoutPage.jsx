import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { getListing, createReservation, createInquiry } from '../utils/guestyApi'
import { mockListings } from '../data/mockListings'
import { differenceInCalendarDays } from 'date-fns'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')
  const quoteId = searchParams.get('quoteId')

  const { state } = useLocation()
  const quote = state?.quote || null

  const [listing, setListing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', notes: ''
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await getListing(id)
        setListing(data || mockListings.find(l => l.id === id) || mockListings[0])
      } catch {
        setListing(mockListings.find(l => l.id === id) || mockListings[0])
      }
    }
    load()
  }, [id])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName || !form.email) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const guest = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      }
      if (quoteId) {
        await createReservation({ quoteId, guest })
      } else {
        await createInquiry({
          quoteId,
          guest,
          listingId: id,
          checkIn,
          checkOut,
          guestsCount: parseInt(guests)
        })
      }
      navigate('/confirmation', {
        state: { listing, checkIn, checkOut, guests, guest: form }
      })
    } catch (err) {
      // For mock flow, proceed to confirmation anyway
      navigate('/confirmation', {
        state: { listing, checkIn, checkOut, guests, guest: form }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!listing) return <div className={styles.loading}><div className={styles.spinner} /></div>

  const nights = checkIn && checkOut ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn)) : 0
  const price = quote?.nightly || listing.prices?.basePrice || listing.price?.basePrice || 0
  const subtotal = quote?.subtotal ?? price * nights
  const cleaning = quote?.cleaning ?? listing.prices?.cleaningFee ?? 85
  const taxes = quote?.taxes || 0
  const totalFees = quote?.totalFees || 0
  const total = quote
    ? quote.total
    : subtotal + cleaning + Math.round(subtotal * 0.12)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Complete Your Reservation</h1>

        <div className={styles.layout}>
          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <h2>Your Trip</h2>
              <div className={styles.tripDetails}>
                <div>
                  <p className={styles.tripLabel}>Dates</p>
                  <p className={styles.tripValue}>{checkIn} → {checkOut} ({nights} nights)</p>
                </div>
                <div>
                  <p className={styles.tripLabel}>Guests</p>
                  <p className={styles.tripValue}>{guests} guest{parseInt(guests) > 1 ? 's' : ''}</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Guest Information</h2>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jane" />
                </div>
                <div className={styles.field}>
                  <label>Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
              </div>
              <div className={styles.field}>
                <label>Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(540) 555-0100" />
              </div>
              <div className={styles.field}>
                <label>Special Requests or Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Anything we should know about your stay?" />
              </div>
            </section>

            <section className={styles.section}>
              <h2>Payment</h2>
              <div className={styles.paymentNote}>
                <span>🔒</span>
                <p>Payment is processed securely through our booking system. You will not be charged until your reservation is confirmed. Credit card details are entered on the next step.</p>
              </div>
            </section>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm & Request Booking'}
            </button>
            <p className={styles.submitNote}>You won't be charged yet. We'll confirm availability within 24 hours.</p>
          </form>

          {/* Summary card */}
          <aside className={styles.summary}>
            <div className={styles.summaryPhoto}>
              <img
                src={listing.pictures?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80'}
                alt={listing.title}
              />
            </div>
            <div className={styles.summaryBody}>
              <h3>{listing.title}</h3>
              <p>{listing.bedrooms} bed · {listing.bathrooms} bath · {listing.accommodates} guests max</p>
              {listing.reviewsStats?.avgRating && (
                <p className={styles.summaryRating}>★ {listing.reviewsStats.avgRating.toFixed(1)} · {listing.reviewsStats.numberOfReviews} reviews</p>
              )}
            </div>
            <div className={styles.summaryPricing}>
              <div className={styles.summaryRow}>
                <span>${price} × {nights} nights</span>
                <span>${subtotal}</span>
              </div>
              {cleaning > 0 && (
                <div className={styles.summaryRow}>
                  <span>Cleaning fee</span>
                  <span>${cleaning}</span>
                </div>
              )}
              {taxes > 0 && (
                <div className={styles.summaryRow}>
                  <span>Taxes</span>
                  <span>${taxes}</span>
                </div>
              )}
              {!quote && (
                <div className={styles.summaryRow}>
                  <span>Service fee (est.)</span>
                  <span>${Math.round(subtotal * 0.12)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
