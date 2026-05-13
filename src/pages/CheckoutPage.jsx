import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { getListing, createReservation, getListingPaymentProvider } from '../utils/guestyApi'
import { mockListings } from '../data/mockListings'
import { differenceInCalendarDays } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { STRIPE_KEY_BY_ACCOUNT } from '../config/stripeKeys'
import styles from './CheckoutPage.module.css'

function CheckoutForm({ listing, quote, checkIn, checkOut, guests }) {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', notes: ''
  })

  const nights = checkIn && checkOut
    ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
    : 0

  const price = quote?.nightly || listing?.prices?.basePrice || listing?.price?.basePrice || 0
  const subtotal = quote?.subtotal ?? price * nights
  const cleaning = quote?.cleaning ?? listing?.prices?.cleaningFee ?? 85
  const taxes = quote?.taxes || 0
  const total = quote
    ? quote.total
    : subtotal + cleaning + Math.round(subtotal * 0.12)

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

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions to continue.')
      return
    }

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.')
      return
    }

    if (!quote?._id) {
      setError('Booking session expired. Please go back and try again.')
      return
    }

    setSubmitting(true)

    try {
      const cardElement = elements.getElement(CardElement)
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone || undefined,
        },
      })

      if (stripeError) {
        setError(stripeError.message)
        setSubmitting(false)
        return
      }

      const guest = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      }

      const reservation = await createReservation({
        quoteId: quote._id,
        ratePlanId: quote.ratePlanId,
        ccToken: paymentMethod.id,
        guest,
      })

      if (!reservation?._id) {
        console.error('Unexpected /instant response (no _id):', reservation)
        setError('Booking could not be confirmed. Please contact us at info@stayroanoke.com or call (540) 732-7151.')
        setSubmitting(false)
        return
      }

      navigate('/confirmation', {
        state: { listing, checkIn, checkOut, guests, guest: form, reservationId: reservation._id }
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.layout}>
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
              <label htmlFor="firstName">First Name *</label>
              <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jane" />
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName">Last Name *</label>
              <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email Address *</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(540) 555-0100" />
          </div>
          <div className={styles.field}>
            <label htmlFor="notes">Special Requests or Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Anything we should know about your stay?" />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Payment</h2>
          <div className={styles.field}>
            <label htmlFor="card-element">Card Details</label>
            <div id="card-element" className={styles.cardElementWrap} role="group" aria-label="Credit card information">
              <CardElement options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#1a1a2e',
                    fontFamily: 'inherit',
                    '::placeholder': { color: '#9ca3af' },
                  },
                  invalid: { color: '#ef4444' },
                },
                hidePostalCode: false,
              }} />
            </div>
          </div>
          <p className={styles.paymentNote}>
            🔒 {checkIn && differenceInCalendarDays(new Date(checkIn), new Date()) <= 10
              ? 'Your card will be charged in full today, as your arrival is within 10 days.'
              : 'Your card will be charged in full 10 days before arrival.'
            } Payments are processed securely through Stripe.
          </p>
          <p className={styles.depositNote}>
            A pre-authorization hold (not a charge) will be placed on your card at check-in to cover potential damages. The hold is released within 5–7 business days after check-out. See our <a href="/terms#damage-deposit" target="_blank" rel="noopener noreferrer">damage policy</a> for details.
          </p>
        </section>

        <div className={styles.termsCheck}>
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
          />
          <label htmlFor="agreeTerms">
            I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>, including the cancellation and payment policy.
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={submitting || !stripe || !agreedToTerms}>
          {submitting ? 'Processing...' : `Reserve Now · $${Number(total).toFixed(2)}`}
        </button>
        <p className={styles.submitNote}>Your card will be charged immediately upon confirmation.</p>
      </form>

      {/* Summary card */}
      <aside className={styles.summary}>
        <div className={styles.summaryPhoto}>
          <img
            src={listing?.pictures?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80'}
            alt={listing?.title}
          />
        </div>
        <div className={styles.summaryBody}>
          <h3>{listing?.title}</h3>
          <p>{listing?.bedrooms} bed · {listing?.bathrooms} bath · {listing?.accommodates} guests max</p>
          {listing?.reviewsStats?.avgRating && (
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
            <span>${Number(total).toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function CheckoutPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')

  const { state } = useLocation()
  const quote = state?.quote || null

  const [listing, setListing] = useState(null)
  const [stripePromise, setStripePromise] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getListing(id)
        setListing(data || mockListings.find(l => l.id === id) || mockListings[0])
      } catch {
        setListing(mockListings.find(l => l.id === id) || mockListings[0])
      }

      try {
        const provider = await getListingPaymentProvider(id)
        const pk = provider?.providerAccountId && STRIPE_KEY_BY_ACCOUNT[provider.providerAccountId]
        if (pk) setStripePromise(loadStripe(pk))
      } catch {
        // payment provider unavailable — stripePromise stays null, form shows error
      }
    }
    load()
  }, [id])

  if (!listing) return <div className={styles.loading}><div className={styles.spinner} /></div>


  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Complete Your Reservation</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            listing={listing}
            quote={quote}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
          />
        </Elements>
      </div>
    </div>
  )
}
