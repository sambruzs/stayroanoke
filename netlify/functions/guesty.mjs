// Uses native fetch (Node 18+) — no node-fetch dependency needed

const GUESTY_AUTH_URL = 'https://booking.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://booking-api.guesty.com/v1'

let cachedToken = null
let tokenExpiry = null

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

const emptyResult = (reason) => ({
  statusCode: 200,
  headers,
  body: JSON.stringify({ results: [], total: 0, _reason: reason })
})

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken
  }

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
    body: params.toString()
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth ${res.status}: ${text}`)
  }

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000
  return cachedToken
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    let token
    try {
      token = await getToken()
    } catch (authErr) {
      console.error('Auth error:', authErr.message)
      return emptyResult('auth_failed: ' + authErr.message)
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

    if (!response.ok) {
      console.error('Guesty API error:', response.status, JSON.stringify(data))
      return emptyResult('guesty_error_' + response.status)
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }

  } catch (err) {
    console.error('Unhandled error:', err.message)
    return emptyResult('unhandled: ' + err.message)
  }
}
