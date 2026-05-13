import { getStore } from '@netlify/blobs'

const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'

// In-process cache — survives within a warm Lambda container
let cachedToken = null
let tokenExpiry = null

const env = {
  get clientId()    { return process.env.GUESTY_CLIENT_ID     || process.env.VITE_GUESTY_CLIENT_ID },
  get clientSecret(){ return process.env.GUESTY_CLIENT_SECRET || process.env.VITE_GUESTY_CLIENT_SECRET },
  get appId()       { return process.env.GUESTY_APP_ID        || process.env.VITE_GUESTY_APP_ID },
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

// ─── Blobs helpers ────────────────────────────────────────────────────────────

const NETLIFY_SITE_ID = 'cd1a5128-46de-48e0-a716-d4257f0d1b91'

function blobsStore() {
  // esbuild strips NETLIFY_BLOBS_CONTEXT, so use explicit credentials when available.
  // NETLIFY_TOKEN = Netlify personal access token set in site env vars.
  const token = process.env.NETLIFY_TOKEN
  if (token) {
    return getStore({ name: 'guesty-auth', siteID: NETLIFY_SITE_ID, token })
  }
  // Fallback: rely on auto-injected context (non-esbuild environments)
  return getStore('guesty-auth')
}

async function readBlobsToken() {
  try {
    const store = blobsStore()
    const stored = await store.get('token', { type: 'json' })
    // 5-min buffer so we never serve a token that's about to expire mid-request
    if (stored?.token && stored?.expiry && Date.now() < stored.expiry - 300_000) {
      return stored
    }
  } catch (e) {
    console.warn('Blobs read failed:', e.message)
  }
  return null
}

export async function saveBlobsToken(token, expiry) {
  try {
    const store = blobsStore()
    await store.set('token', JSON.stringify({ token, expiry }))
  } catch (e) {
    console.warn('Blobs write failed:', e.message)
  }
}

// Daily emergency OAuth counter — key resets naturally with UTC date
function todayKey() {
  return `emergency-count-${new Date().toISOString().slice(0, 10)}`
}

async function getEmergencyCount() {
  try {
    const store = blobsStore()
    const v = await store.get(todayKey(), { type: 'json' })
    return v?.count ?? 0
  } catch { return 0 }
}

async function incrementEmergencyCount() {
  try {
    const store = blobsStore()
    const current = await getEmergencyCount()
    await store.set(todayKey(), JSON.stringify({ count: current + 1 }))
  } catch {}
}

// Soft lock — prevents concurrent containers from each firing an OAuth call
async function readLock() {
  try {
    const store = blobsStore()
    const lock = await store.get('refresh-lock', { type: 'json' })
    if (lock?.at && Date.now() - lock.at < 20_000) return lock
  } catch {}
  return null
}
async function acquireLock() {
  try { await blobsStore().set('refresh-lock', JSON.stringify({ at: Date.now() })) } catch {}
}
async function releaseLock() {
  try { await blobsStore().delete('refresh-lock') } catch {}
}

// ─── OAuth call ───────────────────────────────────────────────────────────────

// Max emergency OAuth calls per day from this function.
// The scheduled refresh uses 1 call/day on its own, leaving 4 remaining.
// We cap emergency use at 3 so there's always 1 in absolute reserve.
const EMERGENCY_DAILY_LIMIT = 3

export async function fetchFreshToken() {
  if (!env.clientId || !env.clientSecret) {
    throw new Error('Missing GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET in Netlify env vars')
  }

  const params = new URLSearchParams({
    grant_type:    'client_credentials',
    scope:         'hq:api',
    client_id:     env.clientId,
    client_secret: env.clientSecret,
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(GUESTY_AUTH_URL, {
      method: 'POST',
      headers: {
        'accept':        'application/json',
        'content-type':  'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      body:   params.toString(),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.status === 429) {
      // Still hit the limit — last-chance check if another container just wrote a token
      const blob = await readBlobsToken()
      if (blob) {
        console.warn('OAuth 429 — using token just written by another container')
        cachedToken = blob.token
        tokenExpiry  = blob.expiry
        return cachedToken
      }
      throw new Error('OAuth 429: daily rate limit exhausted')
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OAuth ${res.status}: ${text}`)
    }

    const data   = await res.json()
    const token  = data.access_token
    const expiry = Date.now() + data.expires_in * 1000

    await saveBlobsToken(token, expiry)
    cachedToken = token
    tokenExpiry  = expiry
    console.log(`✓ Emergency OAuth token acquired, valid until ${new Date(expiry).toISOString()}`)
    return token
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

// ─── Token resolution (never touches OAuth in the happy path) ─────────────────

async function getToken({ forceRefresh = false } = {}) {
  // 1. In-process cache (warm container)
  if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300_000) {
    return cachedToken
  }

  // 2. Netlify Blobs — shared across all containers
  const blob = await readBlobsToken()
  if (blob) {
    if (blob.token !== cachedToken || forceRefresh === false) {
      console.log('Using Blobs-cached token, expires:', new Date(blob.expiry).toISOString())
    }
    cachedToken = blob.token
    tokenExpiry  = blob.expiry
    return cachedToken
  }

  // ── No valid token anywhere — emergency OAuth path ────────────────────────
  // Check daily cap before calling OAuth
  const usedToday = await getEmergencyCount()
  if (usedToday >= EMERGENCY_DAILY_LIMIT) {
    throw new Error(
      `OAuth daily limit reached (${usedToday}/${EMERGENCY_DAILY_LIMIT} emergency calls used). ` +
      'The scheduled refresh may have failed — check Netlify function logs.'
    )
  }

  // Soft lock — let one container do the refresh; others wait and read from Blobs
  const existingLock = await readLock()
  if (existingLock) {
    console.log('Another container is refreshing — waiting up to 15s')
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const fresh = await readBlobsToken()
      if (fresh) {
        cachedToken = fresh.token
        tokenExpiry  = fresh.expiry
        return cachedToken
      }
    }
    console.warn('Lock wait timed out — attempting OAuth anyway')
  }

  await acquireLock()

  // Final Blobs check — another container may have just finished while we waited
  const raceCheck = await readBlobsToken()
  if (raceCheck) {
    await releaseLock()
    cachedToken = raceCheck.token
    tokenExpiry  = raceCheck.expiry
    return cachedToken
  }

  await incrementEmergencyCount()
  console.warn(`Emergency OAuth call #${usedToday + 1} of ${EMERGENCY_DAILY_LIMIT} today`)

  try {
    return await fetchFreshToken()
  } finally {
    await releaseLock()
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

// Allowlist of path prefixes the public booking site is permitted to call.
// Any request outside these prefixes is rejected before it reaches Guesty.
const ALLOWED_PATH_PREFIXES = [
  '/listings',
  '/reservations/quotes',
  '/reservations/inquiry',
  '/reviews',
]

// Only these methods are permitted — no DELETE, no PATCH, no PUT on arbitrary endpoints
const ALLOWED_METHODS = new Set(['GET', 'POST', 'OPTIONS'])

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }

  // ── Method guard ──────────────────────────────────────────────────────────
  if (!ALLOWED_METHODS.has(event.httpMethod)) {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Path allowlist ────────────────────────────────────────────────────────
  const guestyPath = event.path.replace('/.netlify/functions/guesty', '')
  if (!ALLOWED_PATH_PREFIXES.some(prefix => guestyPath.startsWith(prefix))) {
    console.warn('Blocked disallowed path:', guestyPath)
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) }
  }

  let token
  try {
    token = await getToken()
  } catch (authErr) {
    console.error('Auth error:', authErr.message)
    return emptyResult('auth_error')
  }

  const url = `${GUESTY_API_BASE}${guestyPath}${event.rawQuery ? '?' + event.rawQuery : ''}`
  console.log(`→ ${event.httpMethod} ${url}`)

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 15_000)

  const doRequest = (tok) => {
    const reqHeaders = {
      'Authorization': `Bearer ${tok}`,
      'Content-Type':  'application/json',
      'accept':        'application/json; charset=utf-8',
    }
    if (env.appId) reqHeaders['x-guesty-applicationId'] = env.appId
    return fetch(url, {
      method:  event.httpMethod,
      headers: reqHeaders,
      body:    ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined,
      signal:  controller.signal,
    })
  }

  try {
    let response = await doRequest(token)

    // 403 means the token was revoked mid-session — try to get a fresher one once
    if (response.status === 403) {
      console.warn('Got 403 — forcing token refresh')
      cachedToken = null
      tokenExpiry  = null
      const fresh = await getToken({ forceRefresh: true })
      response = await doRequest(fresh)
    }

    clearTimeout(timeout)
    const data = await response.json()

    if (!response.ok) {
      console.error(`Guesty ${response.status}:`, JSON.stringify(data))
      return { statusCode: response.status, headers, body: JSON.stringify(data) }
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    clearTimeout(timeout)
    console.error('Request error:', err.message)
    return emptyResult('request_failed: ' + err.message)
  }
}
