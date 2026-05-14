// Stay Roanoke - Guesty HQ API Client
// Auth:  https://hq-api.guesty.com/oauth2/token
// API:   https://hq-api.guesty.com/booking/api
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
    const body = await res.json().catch(() => ({}))
    const code = body?.error?.code
    const msg = body?.error?.message || body?.message || `API error: ${res.status}`
    const error = new Error(msg)
    if (code) error.code = code
    throw error
  }

  return res.json()
}

// Get all listings — HQ API uses /listings not /search
// Note: date availability is checked per-property on the listing page via the calendar + quote API,
// not at the listings level (Guesty returns 0 results when dates are passed and nothing is free).
export async function getListings({ guests } = {}) {
  const params = new URLSearchParams()
  if (guests) params.set('minOccupancy', guests)
  params.set('limit', '50')
  return guestyFetch(`/listings?${params.toString()}`)
}

// Get single listing
export async function getListing(listingId) {
  return guestyFetch(`/listings/${listingId}`)
}

// Get listing calendar
export async function getListingCalendar(listingId, from, to) {
  return guestyFetch(`/listings/${listingId}/calendar?from=${from}&to=${to}`)
}

// Batch availability check — returns { availableIds: [...] }
export async function checkListingsAvailability({ listingIds, checkIn, checkOut, guests }) {
  return guestyFetch('/availability', {
    method: 'POST',
    body: JSON.stringify({ listingIds, checkIn, checkOut, guests })
  })
}

// Get reservation quote
export async function getReservationQuote({ listingId, checkIn, checkOut, guests, pets = 0 }) {
  const body = {
    listingId,
    checkInDateLocalized: checkIn,
    checkOutDateLocalized: checkOut,
    guestsCount: parseInt(guests)
  }
  if (pets > 0) body.petsCount = parseInt(pets)
  return guestyFetch('/reservations/quotes', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

// Create instant reservation
export async function createReservation({ quoteId, ratePlanId, ccToken, guest, emailContext }) {
  const body = { ratePlanId, ccToken, guest }
  if (emailContext) body._emailContext = emailContext
  return guestyFetch(`/reservations/quotes/${quoteId}/instant`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

// Get payment provider for a listing (returns { providerType, providerAccountId })
export async function getListingPaymentProvider(listingId) {
  return guestyFetch(`/listings/${listingId}/payment-provider`)
}

// Get reviews for a listing
export async function getListingReviews(listingId, limit = 10) {
  return guestyFetch(`/reviews?listingId=${listingId}&limit=${limit}`)
}

// Create inquiry
export async function createInquiry({ listingId, checkIn, checkOut, guestsCount, guest }) {
  return guestyFetch('/reservations/inquiry', {
    method: 'POST',
    body: JSON.stringify({ listingId, checkInDateLocalized: checkIn, checkOutDateLocalized: checkOut, guestsCount, guest })
  })
}
