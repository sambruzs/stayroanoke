import { getStore } from '@netlify/blobs'

const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'

// In-process cache — survives within a warm Lambda container
let cachedToken = null
let tokenExpiry = null

const env = {
  get clientId()    { return process.env.GUESTY_CLIENT_ID },
  get clientSecret(){ return process.env.GUESTY_CLIENT_SECRET },
  get appId()       { return process.env.GUESTY_APP_ID },
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

// ─── Confirmation email ───────────────────────────────────────────────────────

function buildEmailHtml({ firstName, listingTitle, listingCity, listingState, photoUrl, checkInFormatted, checkOutFormatted, guests, pets, confirmationCode, paymentMessage, year }) {
  const petsLine = pets > 0 ? ` &middot; ${pets} pet${pets > 1 ? 's' : ''}` : ''

  // Hero: photo with dark gradient overlay and property name on top
  const heroSection = photoUrl ? `
      <tr>
        <td style="padding:0;position:relative;line-height:0;">
          <div style="position:relative;display:block;">
            <img src="${photoUrl}" width="600" alt="${listingTitle}" style="display:block;width:100%;max-width:600px;height:300px;object-fit:cover;border:0;" />
            <div style="position:absolute;bottom:0;left:0;right:0;padding:32px 32px 24px;background:linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0) 100%);">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-bottom:6px;">${listingCity}, ${listingState}</div>
              <div style="font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;line-height:1.3;">${listingTitle}</div>
            </div>
          </div>
        </td>
      </tr>` : `
      <tr>
        <td style="background-color:#1a3a52;padding:20px 40px 24px;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-bottom:6px;">${listingCity}, ${listingState}</div>
          <div style="font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">${listingTitle}</div>
        </td>
      </tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Booking Confirmed – Stay Roanoke</title></head>
<body style="margin:0;padding:0;background-color:#f0ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ece6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.12);">

      <!-- Header -->
      <tr><td style="background-color:#1B4F72;padding:22px 40px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.14em;font-family:Georgia,serif;">STAY ROANOKE</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:0.22em;margin-top:4px;text-transform:uppercase;">Trusted Local Stays in Virginia's Blue Ridge</div>
      </td></tr>

      <!-- Hero photo with property name overlay -->
      ${heroSection}

      <!-- Confirmed banner -->
      <tr><td style="background-color:#1a5c38;padding:14px 40px;text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.12em;text-transform:uppercase;">&#10003;&nbsp;&nbsp;Booking Confirmed</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background-color:#ffffff;padding:40px;">

        <h1 style="margin:0 0 10px;font-size:27px;color:#2c1810;font-weight:700;font-family:Georgia,serif;">Pack your bags, ${firstName}!</h1>
        <p style="margin:0 0 6px;font-size:16px;color:#1B4F72;font-weight:600;line-height:1.5;">You just booked one of the best stays in Roanoke.</p>
        <p style="margin:0 0 30px;font-size:15px;color:#6b7280;line-height:1.7;">Seriously though — we handpick every property and hold it to a standard most short-term rentals don't bother with. Clean. Comfortable. No surprises. We think you're going to love it.</p>

        <!-- Booking details card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border:1px solid #e8e0d8;border-radius:10px;margin-bottom:22px;">
          <tr>
            <td width="50%" style="padding:20px;border-right:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Check-in</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;margin-bottom:3px;">${checkInFormatted}</div>
              <div style="font-size:12px;color:#9ca3af;">After 4:00 PM</div>
            </td>
            <td width="50%" style="padding:20px;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Check-out</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;margin-bottom:3px;">${checkOutFormatted}</div>
              <div style="font-size:12px;color:#9ca3af;">By 10:00 AM</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Guests</div>
              <div style="font-size:15px;font-weight:600;color:#2c1810;">${guests} guest${guests > 1 ? 's' : ''}${petsLine}</div>
            </td>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Confirmation #</div>
              <div style="font-size:15px;font-weight:700;color:#1B4F72;">${confirmationCode}</div>
            </td>
          </tr>
        </table>

        <!-- Payment -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:30px;">
          <tr><td style="padding:16px 20px;">
            <div style="font-size:11px;font-weight:700;color:#1e40af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px;">&#128274;&nbsp; Payment</div>
            <div style="font-size:14px;color:#1e3a8a;line-height:1.6;">${paymentMessage}</div>
            <div style="font-size:13px;color:#3b82f6;margin-top:6px;line-height:1.5;">A refundable security deposit hold will be placed on your card at check-in and released within 5–7 business days after check-out.</div>
          </td></tr>
        </table>

        <!-- Before you go -->
        <div style="font-size:15px;font-weight:700;color:#2c1810;margin-bottom:16px;font-family:Georgia,serif;">A few things before you arrive</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
          <tr><td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#4b5563;line-height:1.6;">&#128273;&nbsp;&nbsp;<strong>Door code incoming.</strong> We'll send check-in instructions and your access code closer to your arrival date.</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#4b5563;line-height:1.6;">&#129529;&nbsp;&nbsp;<strong>Leave it tidy, not spotless.</strong> Toss your trash, do the dishes, and strip the bedding if you have a minute. Our crew handles everything else.</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#4b5563;line-height:1.6;">&#128230;&nbsp;&nbsp;<strong>No mail or packages, please.</strong> The property can't accept deliveries. Use an Amazon Locker, USPS PO Box, or FedEx/UPS store nearby.</td></tr>
          <tr><td style="padding:11px 0;font-size:14px;color:#4b5563;line-height:1.6;">&#128247;&nbsp;&nbsp;<strong>You're on camera.</strong> (Outside only.) Exterior security cameras are on all our properties for your safety and ours.</td></tr>
        </table>

        <!-- Tagline divider -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr><td style="border-top:1px solid #e8e0d8;padding-top:22px;text-align:center;">
            <div style="font-size:13px;color:#9ca3af;font-style:italic;letter-spacing:0.04em;">Furnished Stays You Can Trust &nbsp;&middot;&nbsp; Feel at Home in the Heart of Roanoke.</div>
          </td></tr>
        </table>

        <!-- Contact -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border-radius:8px;">
          <tr><td style="padding:22px 24px;text-align:center;">
            <div style="font-size:13px;font-weight:700;color:#2c1810;margin-bottom:10px;font-family:Georgia,serif;">Questions? We actually pick up the phone.</div>
            <a href="mailto:info@stayroanoke.com" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;display:block;margin-bottom:5px;">info@stayroanoke.com</a>
            <a href="tel:+15407327151" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;">(540) 732-7151</a>
          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background-color:#152d3f;padding:22px 40px;text-align:center;">
        <div style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8;">
          &copy; ${year} Stay Roanoke &nbsp;&middot;&nbsp; Roanoke, Virginia<br />
          <a href="https://www.stayroanoke.com/terms" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Terms &amp; Conditions</a>
          &nbsp;&middot;&nbsp;
          <a href="https://www.stayroanoke.com" style="color:rgba(255,255,255,0.35);text-decoration:underline;">stayroanoke.com</a>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

async function sendConfirmationEmail({ reservation, emailContext, guest }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email')
    return
  }

  const { listingTitle, listingCity, listingState, photoUrl, checkIn, checkOut, guests, pets, total } = emailContext
  const { firstName, lastName, email } = guest

  const confirmationCode = reservation.confirmationCode || reservation._id

  const formatDate = (str) => {
    const d = new Date(str + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const checkInFormatted  = formatDate(checkIn)
  const checkOutFormatted = formatDate(checkOut)

  const daysUntil = Math.ceil((new Date(checkIn + 'T12:00:00') - new Date()) / 86400000)
  const paymentMessage = daysUntil <= 10
    ? `Your card has been charged $${Number(total).toFixed(2)} in full — your arrival is within 10 days.`
    : `Your card will be charged $${Number(total).toFixed(2)} in full 10 days before your arrival on ${checkInFormatted}.`

  const html = buildEmailHtml({
    firstName, listingTitle, listingCity, listingState, photoUrl,
    checkInFormatted, checkOutFormatted,
    guests, pets, confirmationCode, paymentMessage,
    year: new Date().getFullYear(),
  })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Stay Roanoke <bookings@stayroanoke.com>',
      to: [email],
      subject: `Booking Confirmed – ${listingTitle}`,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend ${res.status}: ${body}`)
  }

  console.log(`✓ Confirmation email sent to ${email} (${confirmationCode})`)
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

  const isInstant = guestyPath.includes('/instant')

  // Strip _emailContext from instant booking body — it's for us, not Guesty
  let bodyToForward = event.body
  let emailContext  = null
  let guestForEmail = null
  if (isInstant && event.body) {
    try {
      const parsed = JSON.parse(event.body)
      if (parsed._emailContext) {
        emailContext  = parsed._emailContext
        guestForEmail = parsed.guest
        delete parsed._emailContext
        bodyToForward = JSON.stringify(parsed)
      }
    } catch {}
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
      body:    ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? bodyToForward : undefined,
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

    if (event.httpMethod === 'POST') {
      console.log(`POST${isInstant ? ' [INSTANT]' : ''} body sent:`, (bodyToForward || '').slice(0, 300))
      console.log(`POST${isInstant ? ' [INSTANT]' : ''} response ${response.status}:`, JSON.stringify(data).slice(0, 800))
    }

    // Send branded confirmation email after successful instant booking
    if (isInstant && data._id) {
      if (emailContext && guestForEmail) {
        try {
          await sendConfirmationEmail({ reservation: data, emailContext, guest: guestForEmail })
        } catch (err) {
          console.error('Confirmation email failed (non-fatal):', err.message)
        }
      } else {
        console.warn('Skipping confirmation email — emailContext missing from request')
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    clearTimeout(timeout)
    console.error('Request error:', err.message)
    return emptyResult('request_failed: ' + err.message)
  }
}
