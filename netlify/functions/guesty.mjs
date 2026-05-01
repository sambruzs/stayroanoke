const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'

let cachedToken = null
let tokenExpiry = null
let tokenPromise = null

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getToken(retries = 3, delayMs = 10000) {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) return cachedToken
  if (tokenPromise) return tokenPromise

  tokenPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const params = new URLSearchParams()
      params.append('grant_type', 'client_credentials')
      params.append('scope', 'hq:api')
      params.append('client_id', process.env.VITE_GUESTY_CLIENT_ID)
      params.append('client_secret', process.env.VITE_GUESTY_CLIENT_SECRET)

      const res = await fetch(GUESTY_AUTH_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
          'cache-control': 'no-cache,no-cache',
        },
        body: params.toString()
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
      return null
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

const emptyResult = (reason) => ({
  statusCode: 200,
  headers,
  body: JSON.stringify({ results: [], total: 0, _reason: reason })
})

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  try {
    let token
    try { token = await getToken() } catch (e) { return emptyResult('auth_failed: ' + e.message) }
    if (!token) return emptyResult('no_token')

    const guestyPath = event.path.replace('/.netlify/functions/guesty', '')
    const url = `${GUESTY_API_BASE}${guestyPath}${event.rawQuery ? '?' + event.rawQuery : ''}`
    console.log(`→ ${event.httpMethod} ${url}`)

    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-guesty-applicationId': process.env.VITE_GUESTY_APP_ID,
        'Content-Type': 'application/json',
        'accept': 'application/json; charset=utf-8',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Guesty error:', response.status, JSON.stringify(data))
      return emptyResult('guesty_error_' + response.status)
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    console.error('Unhandled error:', err.message)
    return emptyResult('unhandled: ' + err.message)
  }
}
