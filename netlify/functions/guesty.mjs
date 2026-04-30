import fetch from 'node-fetch'

const GUESTY_AUTH_URL = 'https://booking-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://booking-api.guesty.com/api'

let cachedToken = null
let tokenExpiry = null
let tokenPromise = null

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getToken(retries = 4, delayMs = 5000) {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken
  }
  if (tokenPromise) return tokenPromise

  tokenPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
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
        const wait = delayMs * attempt
        await sleep(wait)
        continue
      }

      tokenPromise = null
      throw new Error(`Auth failed: ${res.status} ${errText}`)
    }
    tokenPromise = null
    throw new Error('Auth failed after max retries')
  })()

  return tokenPromise
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const token = await getToken()
    const guestyPath = event.path.replace('/.netlify/functions/guesty', '')
    const url = `${GUESTY_API_BASE}${guestyPath}${event.rawQuery ? '?' + event.rawQuery : ''}`

    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json; charset=utf-8',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined
    })

    const data = await response.json()
    return { statusCode: response.status, headers, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
