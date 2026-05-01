import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { getListing, getReservationQuote } from '../utils/guestyApi'
import { mockListings } from '../data/mockListings'
import { format, differenceInCalendarDays } from 'date-fns'
import { getGalleryImage, getThumbImage } from '../utils/imageUtils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ListingPage.module.css'

const AMENITY_ICONS = {
  'Air conditioning': '❄️', 'Wifi': '📶', 'Hot tub': '🛁', 'Pool': '🏊',
  'Kitchen': '🍳', 'Parking': '🚗', 'Washer': '🧺', 'Dryer': '🧺',
  'Fireplace': '🔥', 'Fire pit': '🪵', 'Pets allowed': '🐾',
  'Game room': '🎮', 'Kayaks': '🛶', 'Deck': '🪟', 'TV': '📺',
  'EV charger': '⚡', 'BBQ grill': '🍖', 'Gym': '🏋️'
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
  const [quoteError, setQuoteError] = useState('')

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

  async function fetchQuote() {
    if (!checkIn || !checkOut || !listing) return
    setQuoteLoading(true)
    setQuoteError('')
    try {
      const data = await getReservationQuote({
        listingId: listing._id || listing.id,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        guests
      })
      setQuote(data)
    } catch {
      // Fall back to calculated estimate
      const nights = differenceInCalendarDays(checkOut, checkIn)
      const nightly = listing?.prices?.basePrice || listing?.price?.basePrice || 0
      const subtotal = nightly * nights
      const cleaning = listing?.prices?.cleaningFee || 85
      const serviceFee = Math.round(subtotal * 0.12)
      setQuote({
        mock: true,
        nights,
        nightly,
        subtotal,
        cleaning,
        serviceFee,
        total: subtotal + cleaning + serviceFee
      })
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

  if (loading) return (
    <div className={styles.loadingPage}><div className={styles.spinner} /></div>
  )
  if (!listing) return <div className={styles.loadingPage}>Property not found.</div>

  const photos = listing.pictures?.length ? listing.pictures : [{ thumbnail: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80' }]
  const mainPhoto = getGalleryImage(photos[photoIndex]?.thumbnail || photos[photoIndex]?.original)
  const price = listing.prices?.basePrice || listing.price?.basePrice || 0

  // Build amenities list from Guesty HQ format
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
                  <img src={getThumbImage(p.thumbnail || p.original)} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.content}>
          {/* Left column */}
          <div className={styles.details}>
            <p className={styles.location}>
              {listing.address?.city || 'Roanoke'}, {listing.address?.state || 'Virginia'}
            </p>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.meta}>
              {listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms · Up to {listing.accommodates} guests
            </p>
            {listing.reviewsStats?.avgRating > 0 && (
              <p className={styles.rating}>
                ★ {listing.reviewsStats.avgRating.toFixed(1)}
                <span> · {listing.reviewsStats.numberOfReviews} reviews</span>
              </p>
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
                    placeholderText="Add date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
                <div className={styles.dateField}>
                  <label>Check Out</label>
                  <DatePicker
                    selected={checkOut}
                    onChange={d => setCheckOut(d)}
                    minDate={checkIn || new Date()}
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
                    <span>${quote.subtotal || quote.money?.subTotalPrice}</span>
                  </div>
                  {(quote.cleaning || quote.money?.cleaningFee) > 0 && (
                    <div className={styles.priceRow}>
                      <span>Cleaning fee</span>
                      <span>${quote.cleaning || quote.money?.cleaningFee}</span>
                    </div>
                  )}
                  {(quote.serviceFee || quote.money?.guestyServiceFee) > 0 && (
                    <div className={styles.priceRow}>
                      <span>Service fee</span>
                      <span>${quote.serviceFee || quote.money?.guestyServiceFee}</span>
                    </div>
                  )}
                  <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                    <span>Total</span>
                    <span>${quote.total || quote.money?.totalPrice}</span>
                  </div>
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
