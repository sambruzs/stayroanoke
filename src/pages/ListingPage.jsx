import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { getListing, getReservationQuote, getListingCalendar, getListingReviews } from '../utils/guestyApi'
import { mockListings } from '../data/mockListings'
import { format, differenceInCalendarDays, addDays, parseISO } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ListingPage.module.css'
import { getGalleryImage, getThumbImage } from '../utils/imageUtils'
import Reviews from '../components/Reviews'

const AMENITY_ICONS = {
  'Air conditioning': '❄️', 'Wifi': '📶', 'Hot tub': '🛁', 'Pool': '🏊',
  'Kitchen': '🍳', 'Parking': '🚗', 'Washer': '🧺', 'Dryer': '🧺',
  'Fireplace': '🔥', 'Fire pit': '🪵', 'Pets allowed': '🐾',
  'Game room': '🎮', 'Kayaks': '🛶', 'Deck': '🪟', 'TV': '📺',
  'EV charger': '⚡', 'BBQ grill': '🍖', 'Gym': '🏋️',
  'Baking sheet': '🍪', 'Bathtub': '🛁', 'Coffee maker': '☕'
}

export default function ListingPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [blockedDates, setBlockedDates] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null
  )
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : null
  )
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2'))

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getListing(id)
        if (data && (data._id || data.id)) {
          setListing(data)
          loadCalendar(data._id || data.id)
          loadReviews(data._id || data.id)
        } else {
          const mock = mockListings.find(l => l.id === id) || mockListings[0]
          setListing(mock)
        }
      } catch {
        const mock = mockListings.find(l => l.id === id) || mockListings[0]
        setListing(mock)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function loadReviews(listingId) {
    setReviewsLoading(true)
    try {
      const data = await getListingReviews(listingId, 10)
      const reviewList = data?.data || data?.results || data?.reviews || []
      console.log(`Loaded ${reviewList.length} reviews`)
      setReviews(reviewList)
    } catch (e) {
      console.log('Reviews not available:', e.message)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  async function loadCalendar(listingId) {
    try {
      const from = format(new Date(), 'yyyy-MM-dd')
      const to = format(addDays(new Date(), 365), 'yyyy-MM-dd')
      const calData = await getListingCalendar(listingId, from, to)

      const blocked = []
      const days = Array.isArray(calData) ? calData : calData?.days || calData?.data || []

      days.forEach(day => {
        const blocks = day.blocks || {}
        // Only block if actually booked or reserved by a guest
        // b = booked, r = reserved, o = owner block, m = maintenance
        const isBlocked = blocks.b || blocks.r || blocks.o || blocks.m
        if (isBlocked) {
          blocked.push(parseISO(day.date))
        }
      })

      console.log(`Blocking ${blocked.length} booked dates out of ${days.length} total`)
      setBlockedDates(blocked)
    } catch (e) {
      console.log('Calendar not available:', e.message)
      setBlockedDates([])
    }
  }

  async function fetchQuote() {
    if (!checkIn || !checkOut || !listing) return
    setQuoteLoading(true)
    try {
      const data = await getReservationQuote({
        listingId: listing._id || listing.id,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        guests
      })

      // Guesty quote response: rates.ratePlans[0].ratePlan.money contains the breakdown
      const ratePlan = data?.rates?.ratePlans?.[0]?.ratePlan
      const money = ratePlan?.money
      const nights = differenceInCalendarDays(checkOut, checkIn)
      const nightly = money?.fareAccommodation
        ? Math.round(money.fareAccommodation / nights)
        : (listing?.prices?.basePrice || listing?.price?.basePrice || 0)

      if (money) {
        setQuote({
          _id: data._id,
          ratePlanId: ratePlan?._id,
          nights,
          nightly,
          subtotal: money.fareAccommodation,
          cleaning: money.fareCleaning,
          taxes: money.totalTaxes,
          totalFees: money.totalFees,
          invoiceItems: money.invoiceItems || [],
          total: money.subTotalPrice + (money.totalTaxes || 0),
          hostPayout: money.hostPayout,
        })
      } else {
        throw new Error('No rate plan in quote response')
      }
    } catch (err) {
      console.log('Quote failed, using estimate:', err.message)
      // Fall back to calculated estimate
      const nights = differenceInCalendarDays(checkOut, checkIn)
      const nightly = listing?.prices?.basePrice || listing?.price?.basePrice || 0
      const subtotal = nightly * nights
      const cleaning = listing?.prices?.cleaningFee || 85
      const serviceFee = Math.round(subtotal * 0.12)
      setQuote({ mock: true, nights, nightly, subtotal, cleaning, serviceFee, total: subtotal + cleaning + serviceFee })
    } finally {
      setQuoteLoading(false)
    }
  }

  useEffect(() => {
    if (checkIn && checkOut && listing) fetchQuote()
  }, [checkIn, checkOut, listing])

  function handleBook() {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    params.set('guests', guests)
    if (quote && !quote.mock) params.set('quoteId', quote._id)
    navigate(`/checkout/${listing._id || listing.id}?${params.toString()}`)
  }

  if (loading) return <div className={styles.loadingPage}><div className={styles.spinner} /></div>
  if (!listing) return <div className={styles.loadingPage}>Property not found.</div>

  const photos = listing.pictures?.length ? listing.pictures : [{ thumbnail: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80' }]
  const mainPhoto = getGalleryImage(photos[photoIndex]?.original || photos[photoIndex]?.thumbnail)
  const price = listing.prices?.basePrice || listing.price?.basePrice || 0
  const amenities = listing.amenities || listing.publicDescription?.amenities || []
  const amenityList = Array.isArray(amenities)
    ? amenities
    : Object.keys(amenities).filter(k => amenities[k])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to={`/search?${searchParams.toString()}`} className={styles.back}>← Back to results</Link>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            <img src={mainPhoto} alt={listing.title} />
          </div>
          {photos.length > 1 && (
            <div className={styles.thumbs}>
              {photos.slice(0, 5).map((p, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === photoIndex ? styles.activeThumb : ''}`}
                  onClick={() => setPhotoIndex(i)}
                >
                  <img src={getThumbImage(p.original || p.thumbnail)} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.details}>
            <p className={styles.location}>{listing.address?.city || 'Roanoke'}, {listing.address?.state || 'Virginia'}</p>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.meta}>{listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms · Up to {listing.accommodates} guests</p>
            {listing.reviewsStats?.avgRating > 0 && (
              <p className={styles.rating}>★ {listing.reviewsStats.avgRating.toFixed(1)}<span> · {listing.reviewsStats.numberOfReviews} reviews</span></p>
            )}

            <div className={styles.divider} />

            <div className={styles.description}>
              <h2>About this property</h2>
              <p>{listing.publicDescription?.summary || listing.publicDescription?.space || 'A wonderful stay in the Blue Ridge Mountains.'}</p>
            </div>

            {amenityList.length > 0 && (
              <>
                <div className={styles.divider} />
                <div className={styles.amenities}>
                  <h2>Amenities</h2>
                  <div className={styles.amenityGrid}>
                    {amenityList.slice(0, 12).map(a => (
                      <div key={a} className={styles.amenity}>
                        <span>{AMENITY_ICONS[a] || '✓'}</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(reviews.length > 0 || reviewsLoading) && (
              <>
                <div className={styles.divider} />
                <div className={styles.reviewsSection}>
                  <h2>Reviews</h2>
                  <Reviews
                    reviews={reviews}
                    stats={listing.reviewsStats}
                    loading={reviewsLoading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Booking panel */}
          <aside className={styles.bookingPanel}>
            <div className={styles.panelInner}>
              {price > 0 && (
                <div className={styles.panelPrice}>
                  <strong>${price}</strong> <span>/ night</span>
                </div>
              )}

              <div className={styles.dateFields}>
                <div className={styles.dateField}>
                  <label>Check In</label>
                  <DatePicker
                    selected={checkIn}
                    onChange={d => { setCheckIn(d); if (checkOut && d >= checkOut) setCheckOut(null) }}
                    minDate={new Date()}
                    excludeDates={blockedDates}
                    placeholderText="Add date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
                <div className={styles.dateField}>
                  <label>Check Out</label>
                  <DatePicker
                    selected={checkOut}
                    onChange={d => setCheckOut(d)}
                    minDate={checkIn ? addDays(checkIn, 1) : new Date()}
                    excludeDates={blockedDates}
                    placeholderText="Add date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
              </div>

              <div className={styles.guestField}>
                <label>Guests</label>
                <div className={styles.guestControl}>
                  <button onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                  <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                  <button onClick={() => setGuests(g => Math.min(listing.accommodates || 16, g + 1))}>+</button>
                </div>
              </div>

              {quoteLoading && <div className={styles.quoteLoading}>Calculating price...</div>}

              {quote && !quoteLoading && (
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>${quote.nightly || price} × {quote.nights} nights</span>
                    <span>${quote.subtotal}</span>
                  </div>
                  {quote.cleaning > 0 && (
                    <div className={styles.priceRow}>
                      <span>Cleaning fee</span>
                      <span>${quote.cleaning}</span>
                    </div>
                  )}
                  {/* Show taxes from invoice items (normalType TAX), or fall back to totalTaxes */}
                  {quote.invoiceItems?.filter(i => i.type === 'TAX' && i.amount > 0).length > 0
                    ? quote.invoiceItems.filter(i => i.type === 'TAX' && i.amount > 0).map((item, idx) => (
                        <div key={idx} className={styles.priceRow}>
                          <span>{item.title}</span>
                          <span>${item.amount.toFixed(2)}</span>
                        </div>
                      ))
                    : quote.taxes > 0 && (
                        <div className={styles.priceRow}>
                          <span>Taxes</span>
                          <span>${quote.taxes.toFixed(2)}</span>
                        </div>
                      )
                  }
                  {/* Fallback for mock quote */}
                  {quote.mock && quote.serviceFee > 0 && (
                    <div className={styles.priceRow}>
                      <span>Service fee (est.)</span>
                      <span>${quote.serviceFee}</span>
                    </div>
                  )}
                  <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                    <span>Total</span>
                    <span>${quote.total}</span>
                  </div>
                  {quote.mock && (
                    <p className={styles.mockNote}>* Estimated pricing. Select dates to see exact total.</p>
                  )}
                </div>
              )}

              <button
                className={styles.bookBtn}
                onClick={handleBook}
                disabled={!checkIn || !checkOut}
              >
                {checkIn && checkOut ? 'Reserve Now' : 'Select Dates to Book'}
              </button>
              <p className={styles.panelNote}>
                {checkIn && checkOut ? "You won't be charged yet" : 'Select dates to see total price'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
