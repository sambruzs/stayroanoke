const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'

// Module-level token cache
let cachedToken = null
let tokenExpiry = null

// Support both VITE_ prefixed (Vite/build) and plain (server-side/functions) env var names
const env = {
  get token() { return process.env.GUESTY_TOKEN || process.env.VITE_GUESTY_TOKEN },
  get clientId() { return process.env.GUESTY_CLIENT_ID || process.env.VITE_GUESTY_CLIENT_ID },
  get clientSecret() { return process.env.GUESTY_CLIENT_SECRET || process.env.VITE_GUESTY_CLIENT_SECRET },
  get appId() { return process.env.GUESTY_APP_ID || process.env.VITE_GUESTY_APP_ID },
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

function invalidateToken() {
  cachedToken = null
  tokenExpiry = null
}

async function getToken({ forceOAuth = false } = {}) {
  // 1. Use module-level cache if still valid
  if (!forceOAuth && cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    console.log('Using cached token')
    return cachedToken
  }

  // 2. Use pre-stored token from environment variable if available (skip on forceOAuth)
  console.log('env var presence — GUESTY_TOKEN:', !!process.env.GUESTY_TOKEN, '| VITE_GUESTY_TOKEN:', !!process.env.VITE_GUESTY_TOKEN, '| GUESTY_APP_ID:', !!process.env.GUESTY_APP_ID, '| VITE_GUESTY_APP_ID:', !!process.env.VITE_GUESTY_APP_ID, '| CLIENT_ID:', !!(process.env.GUESTY_CLIENT_ID || process.env.VITE_GUESTY_CLIENT_ID))
  const storedToken = env.token
  if (!forceOAuth && storedToken) {
    console.log('Using pre-stored token from env, length:', storedToken.length)
    cachedToken = storedToken
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
    return cachedToken
  }

  // 3. Fetch a fresh token via client credentials OAuth
  if (!env.clientId || !env.clientSecret) {
    throw new Error('No GUESTY_TOKEN and no client credentials available — check env var scopes in Netlify dashboard')
  }
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('scope', 'hq:api')
  params.append('client_id', env.clientId)
  params.append('client_secret', env.clientSecret)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(GUESTY_AUTH_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache,no-cache',
      },
      body: params.toString(),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Auth ${res.status}: ${text}`)
    }

    const data = await res.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + data.expires_in * 1000
    console.log('✓ Fresh Guesty token acquired')
    return cachedToken
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
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
    const appId = env.appId
    console.log('App ID present:', !!appId, '| value:', appId)
    console.log(`→ ${event.httpMethod} ${url}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const doRequest = async (tok) => {
      const reqHeaders = {
        'Authorization': `Bearer ${tok}`,
        'Content-Type': 'application/json',
        'accept': 'application/json; charset=utf-8',
      }
      if (appId) reqHeaders['x-guesty-applicationId'] = appId
      return fetch(url, {
        method: event.httpMethod,
        headers: reqHeaders,
        body: ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined,
        signal: controller.signal
      })
    }

    try {
      let response = await doRequest(token)

      // On 403, the stored token may be expired — force OAuth and retry
      if (response.status === 403) {
        console.warn('Got 403, invalidating token and retrying with fresh credentials')
        invalidateToken()
        const freshToken = await getToken({ forceOAuth: true })
        clearTimeout(timeout)
        response = await doRequest(freshToken)
      } else {
        clearTimeout(timeout)
      }

      const data = await response.json()

      if (!response.ok) {
        console.error('Guesty API error:', response.status, JSON.stringify(data))
        // Pass 400s through so the client can surface booking restriction errors
        if (response.status === 400) {
          return { statusCode: 400, headers, body: JSON.stringify(data) }
        }
        return emptyResult('guesty_error_' + response.status)
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) }
    } catch (err) {
      clearTimeout(timeout)
      throw err
    }
  } catch (err) {
    console.error('Unhandled error:', err.message)
    return emptyResult('unhandled: ' + err.message)
  }
}
