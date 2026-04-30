import fetch from 'node-fetch'

const GUESTY_AUTH_URL = 'https://booking.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://booking-api.guesty.com/v1'

let cachedToken = null
let tokenExpiry = null
let tokenPromise = null

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getToken(retries = 3, delayMs = 10000) {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) return cachedToken
  if (tokenPromise) return tokenPromise

  tokenPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const params = new URLSearchParams()
        params.append('grant_type', 'client_credentials')
        params.append('scope', 'booking_engine:api')
        params.append('client_id', process.env.VITE_GUESTY_CLIENT_ID)
        params.append('client_secret', process.env.VITE_GUESTY_CLIENT_SECRET)

        const res = await fetch(GUESTY_AUTH_URL, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'cache-control': 'no-cache',
          },
          body: params
        })

        if (res.ok) {
          const data = await res.json()
          cachedToken = data.access_token
          tokenExpiry = Date.now() + data.expires_in * 1000
          tokenPromise = null
          return cachedToken
        }

        const errText = await res.text()
        if (res.status === 429 && attempt < retries) {
          await sleep(delayMs * attempt)
          continue
        }

        tokenPromise = null
        // Return null instead of throwing — caller will handle gracefully
        return null
      } catch (e) {
        tokenPromise = null
        return null
      }
    }
    tokenPromise = null
    return null
  })()

  return tokenPromise
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    const token = await getToken()

    // No token available — return empty results so frontend falls back to mock data
    if (!token) {
      console.log('No token available, returning empty results')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ results: [], total: 0, _usedMock: true })
      }
    }

    const guestyPath = event.path.replace('/.netlify/functions/guesty', '')
    const url = `${GUESTY_API_BASE}${guestyPath}${event.rawQuery ? '?' + event.rawQuery : ''}`

    console.log(`→ ${event.httpMethod} ${url}`)

    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined
    })

    const data = await response.json()

    // If Guesty returns an error, still return 200 with empty results
    // so the frontend can fall back to mock data gracefully
    if (!response.ok) {
      console.log(`Guesty returned ${response.status}:`, JSON.stringify(data))
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ results: [], total: 0, _guestyError: data })
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    console.error('Function error:', err.message)
    // Always return 200 with empty results — never let the function 502
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results: [], total: 0, _error: err.message })
    }
  }
}
