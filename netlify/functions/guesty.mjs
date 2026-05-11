import { getStore } from '@netlify/blobs'

const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'

// Module-level cache — survives within a warm container only
let cachedToken = null
let tokenExpiry = null

const env = {
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

async function readBlobsToken() {
  try {
    const store = getStore('guesty-auth')
    const stored = await store.get('token', { type: 'json' })
    if (stored?.token && stored?.expiry && Date.now() < stored.expiry - 300000) {
      return stored
    }
  } catch (e) {
    console.log('Blobs read failed:', e.message)
  }
  return null
}

async function saveBlobsToken(token, expiry) {
  try {
    const store = getStore('guesty-auth')
    await store.set('token', JSON.stringify({ token, expiry }))
    console.log('✓ Token saved to Blobs')
  } catch (e) {
    console.log('Blobs write failed:', e.message)
  }
}

async function readBlobsLock() {
  try {
    const store = getStore('guesty-auth')
    const lock = await store.get('refresh-lock', { type: 'json' })
    if (lock?.at && Date.now() - lock.at < 20000) return lock
  } catch {}
  return null
}

async function acquireBlobsLock() {
  try {
    const store = getStore('guesty-auth')
    await store.set('refresh-lock', JSON.stringify({ at: Date.now() }))
  } catch {}
}

async function releaseBlobsLock() {
  try {
    const store = getStore('guesty-auth')
    await store.delete('refresh-lock')
  } catch {}
}

async function fetchFreshToken() {
  if (!env.clientId || !env.clientSecret) {
    throw new Error('No client credentials available — check VITE_GUESTY_CLIENT_ID / VITE_GUESTY_CLIENT_SECRET in Netlify')
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
        'cache-control': 'no-cache',
      },
      body: params.toString(),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (res.status === 429) {
      // Rate limited — another container may have just succeeded; check Blobs before giving up
      const blob = await readBlobsToken()
      if (blob) {
        console.warn('OAuth 429 rate-limited, using Blobs token written by another container')
        cachedToken = blob.token
        tokenExpiry = blob.expiry
        return cachedToken
      }
      throw new Error('OAuth 429: rate limit hit and no cached token available')
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Auth ${res.status}: ${text}`)
    }

    const data = await res.json()
    const token = data.access_token
    const expiry = Date.now() + data.expires_in * 1000

    // Persist across all containers via Blobs
    await saveBlobsToken(token, expiry)

    cachedToken = token
    tokenExpiry = expiry
    console.log('✓ Fresh Guesty token acquired via OAuth')
    return token
  } catch (err) {
    clearTimeout(timeout)
    throw err
  } finally {
    await releaseBlobsLock()
  }
}

async function getToken({ forceOAuth = false } = {}) {
  // 1. Warm container cache
  if (!forceOAuth && cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    console.log('Using module-cached token')
    return cachedToken
  }

  // 2. Netlify Blobs — shared across all containers (prevents redundant OAuth calls)
  if (!forceOAuth) {
    const blob = await readBlobsToken()
    if (blob) {
      console.log('Using Blobs-cached token, expires:', new Date(blob.expiry).toISOString())
      cachedToken = blob.token
      tokenExpiry = blob.expiry
      return cachedToken
    }
  }

  // 3. On forceOAuth (after 403): check if another container already refreshed the token
  if (forceOAuth) {
    const blob = await readBlobsToken()
    if (blob && blob.token !== cachedToken) {
      console.log('Another container already refreshed the token, using that')
      cachedToken = blob.token
      tokenExpiry = blob.expiry
      return cachedToken
    }
  }

  // 4. Soft lock — if another container is mid-refresh, wait up to 15s for it to finish
  const lock = await readBlobsLock()
  if (lock) {
    console.log('Refresh lock held by another container — polling Blobs for new token')
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const blob = await readBlobsToken()
      if (blob) {
        console.log('Got token from Blobs after waiting on lock')
        cachedToken = blob.token
        tokenExpiry = blob.expiry
        return cachedToken
      }
    }
    console.warn('Lock wait timed out — proceeding with OAuth anyway')
  }

  // 5. OAuth — rate limited to 5/day, only reached when token is truly expired
  await acquireBlobsLock()
  // Final Blobs check after acquiring lock (another container may have just finished)
  const blobAfterLock = await readBlobsToken()
  if (blobAfterLock) {
    await releaseBlobsLock()
    console.log('Token written by another container just before our lock — using it')
    cachedToken = blobAfterLock.token
    tokenExpiry = blobAfterLock.expiry
    return cachedToken
  }
  return fetchFreshToken()
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

      // On 403, token may be expired — check Blobs for a fresher one, then OAuth if needed
      if (response.status === 403) {
        console.warn('Got 403 — refreshing token')
        cachedToken = null
        tokenExpiry = null
        const freshToken = await getToken({ forceOAuth: true })
        clearTimeout(timeout)
        response = await doRequest(freshToken)
      } else {
        clearTimeout(timeout)
      }

      const data = await response.json()

      if (!response.ok) {
        console.error('Guesty API error:', response.status, JSON.stringify(data))
        return { statusCode: response.status, headers, body: JSON.stringify(data) }
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
