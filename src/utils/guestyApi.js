// Stay Roanoke - Guesty API Client
// In development: calls local Express proxy at localhost:3001/api
// In production: calls Netlify Function at /.netlify/functions/guesty

const isProd = import.meta.env.PROD
const API_BASE = isProd ? '/.netlify/functions/guesty' : '/api'

async function guestyFetch(path, options = {}) {
  const url = `${API_BASE}${path}`

  const res = await fetch(url, {
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

export async function getListings({ checkIn, checkOut, guests } = {}) {
  const params = new URLSearchParams()
  if (checkIn) params.set('checkInDateLocalized', checkIn)
  if (checkOut) params.set('checkOutDateLocalized', checkOut)
  if (guests) params.set('minOccupancy', guests)
  const query = params.toString()
  return guestyFetch(`/listings${query ? '?' + query : ''}`)
}

export async function getListing(listingId) {
  return guestyFetch(`/listings/${listingId}`)
}

export async function getListingCalendar(listingId, from, to) {
  return guestyFetch(`/listings/${listingId}/calendar?from=${from}&to=${to}`)
}

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

export async function createReservation({ quoteId, ratePlanId, ccToken, guest }) {
  return guestyFetch('/reservations/instantly', {
    method: 'POST',
    body: JSON.stringify({ quoteId, ratePlanId, ccToken, guest })
  })
}

export async function createInquiry({ listingId, checkIn, checkOut, guestsCount, guest }) {
  return guestyFetch('/reservations/inquiry', {
    method: 'POST',
    body: JSON.stringify({ listingId, checkInDateLocalized: checkIn, checkOutDateLocalized: checkOut, guestsCount, guest })
  })
}
