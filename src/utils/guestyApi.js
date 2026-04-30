// Stay Roanoke - Guesty Booking Engine API Client
// Auth:  https://booking.guesty.com/oauth2/token
// API:   https://booking-api.guesty.com/v1
// Proxy: In dev → local Express server. In prod → Netlify function.

const isProd = import.meta.env.PROD
const API_BASE = isProd ? '/.netlify/functions/guesty' : '/api'

async function guestyFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || err.error || `API error: ${res.status}`)
  }

  return res.json()
}

// Search listings — uses /v1/search endpoint
export async function getListings({ checkIn, checkOut, guests } = {}) {
  const params = new URLSearchParams()
  if (checkIn) params.set('checkIn', checkIn)
  if (checkOut) params.set('checkOut', checkOut)
  if (guests) params.set('adults', guests)
  const query = params.toString()
  return guestyFetch(`/search${query ? '?' + query : ''}`)
}

// Get single listing
export async function getListing(listingId) {
  return guestyFetch(`/listings/${listingId}`)
}

// Get listing calendar
export async function getListingCalendar(listingId, from, to) {
  return guestyFetch(`/listings/${listingId}/calendar?from=${from}&to=${to}`)
}

// Get reservation quote
export async function getReservationQuote({ listingId, checkIn, checkOut, guests }) {
  return guestyFetch('/quotes', {
    method: 'POST',
    body: JSON.stringify({
      listingId,
      checkInDateLocalized: checkIn,
      checkOutDateLocalized: checkOut,
      guestsCount: parseInt(guests)
    })
  })
}

// Create instant reservation
export async function createReservation({ quoteId, ratePlanId, ccToken, guest }) {
  return guestyFetch('/reservations/instantly', {
    method: 'POST',
    body: JSON.stringify({ quoteId, ratePlanId, ccToken, guest })
  })
}

// Create inquiry
export async function createInquiry({ listingId, checkIn, checkOut, guestsCount, guest }) {
  return guestyFetch('/reservations/inquiry', {
    method: 'POST',
    body: JSON.stringify({ listingId, checkInDateLocalized: checkIn, checkOutDateLocalized: checkOut, guestsCount, guest })
  })
}
