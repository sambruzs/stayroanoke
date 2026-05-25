// Guesty webhook receiver — sends a branded cancellation email via Resend
// when a reservation is cancelled.
//
// Configure in Guesty:
//   Settings → Webhooks → Add webhook
//   URL: https://stayroanoke.com/.netlify/functions/guesty-webhook
//   Events: reservation.updated (or reservation.canceled if exposed)
//   Secret: any string; also set GUESTY_WEBHOOK_SECRET in Netlify env
//
// Env vars required:
//   RESEND_API_KEY           — same key used by confirmation emails
//   GUESTY_WEBHOOK_SECRET    — optional but recommended; verifies HMAC
//   GUESTY_CLIENT_ID, GUESTY_CLIENT_SECRET — used only if we need to fetch
//                              full reservation/listing details
import { createHmac, timingSafeEqual } from 'node:crypto'
import { getStore } from '@netlify/blobs'

const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'
const NETLIFY_SITE_ID = 'cd1a5128-46de-48e0-a716-d4257f0d1b91'

const ALLOWED_ORIGIN = process.env.NODE_ENV === 'development' ? '*' : 'https://stayroanoke.com'
const baseHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type, x-guesty-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// ─── Idempotency via Netlify Blobs ───────────────────────────────────────────
function idempotencyStore() {
  const token = process.env.NETLIFY_TOKEN
  if (token) return getStore({ name: 'cancellation-emails', siteID: NETLIFY_SITE_ID, token })
  return getStore('cancellation-emails')
}

async function alreadySent(reservationId) {
  try {
    const v = await idempotencyStore().get(reservationId)
    return !!v
  } catch { return false }
}

async function markSent(reservationId) {
  try {
    await idempotencyStore().set(reservationId, new Date().toISOString())
  } catch (e) {
    console.warn('Failed to mark cancellation idempotency:', e.message)
  }
}

// ─── Signature verification ──────────────────────────────────────────────────
function verifySignature(rawBody, headers) {
  const secret = process.env.GUESTY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('GUESTY_WEBHOOK_SECRET not set — skipping signature verification')
    return true
  }
  const sig = headers['x-guesty-signature'] || headers['X-Guesty-Signature']
  if (!sig) {
    console.warn('No x-guesty-signature header on webhook')
    return false
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ─── Guesty API helpers (fetch reservation if webhook is minimal) ────────────
async function getGuestyToken() {
  const clientId = process.env.GUESTY_CLIENT_ID
  const clientSecret = process.env.GUESTY_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  const res = await fetch(GUESTY_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'booking_engine:api',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) {
    console.error('Token fetch failed:', res.status, await res.text())
    return null
  }
  const data = await res.json()
  return data.access_token
}

async function fetchReservation(reservationId) {
  const token = await getGuestyToken()
  if (!token) return null
  const res = await fetch(`${GUESTY_API_BASE}/reservations/${reservationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    console.error('Reservation fetch failed:', res.status, await res.text())
    return null
  }
  return res.json()
}

// ─── Email rendering ─────────────────────────────────────────────────────────
function encodeHTML(str) {
  if (typeof str !== 'string') return String(str ?? '')
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str.length === 10 ? str + 'T12:00:00' : str)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function buildCancellationHtml(raw) {
  const { photoUrl, checkInFormatted, checkOutFormatted, guestsCount, confirmationCode, refundMessage, year } = raw
  const firstName    = encodeHTML(raw.firstName)
  const listingTitle = encodeHTML(raw.listingTitle)
  const listingCity  = encodeHTML(raw.listingCity)
  const listingState = encodeHTML(raw.listingState)

  const heroSection = photoUrl ? `
      <tr><td style="padding:0;position:relative;line-height:0;">
        <div style="position:relative;display:block;">
          <img src="${photoUrl}" width="600" alt="${listingTitle}" style="display:block;width:100%;max-width:600px;height:300px;object-fit:cover;border:0;filter:grayscale(40%);" />
          <div style="position:absolute;bottom:0;left:0;right:0;padding:32px 32px 24px;background:linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0) 100%);">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.75);text-transform:uppercase;margin-bottom:6px;">${listingCity}, ${listingState}</div>
            <div style="font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;line-height:1.3;">${listingTitle}</div>
          </div>
        </div>
      </td></tr>` : `
      <tr><td style="background-color:#1a3a52;padding:20px 40px 24px;text-align:center;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:rgba(255,255,255,0.6);text-transform:uppercase;margin-bottom:6px;">${listingCity}, ${listingState}</div>
        <div style="font-size:20px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">${listingTitle}</div>
      </td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Booking Cancelled – Stay Roanoke</title></head>
<body style="margin:0;padding:0;background-color:#f0ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ece6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.12);">

      <tr><td style="background-color:#1B4F72;padding:22px 40px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.14em;font-family:Georgia,serif;">STAY ROANOKE</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:0.22em;margin-top:4px;text-transform:uppercase;">Trusted Local Stays in Virginia's Blue Ridge</div>
      </td></tr>

      ${heroSection}

      <tr><td style="background-color:#7a2e2e;padding:14px 40px;text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.12em;text-transform:uppercase;">&#10006;&nbsp;&nbsp;Booking Cancelled</div>
      </td></tr>

      <tr><td style="background-color:#ffffff;padding:40px;">

        <h1 style="margin:0 0 10px;font-size:27px;color:#2c1810;font-weight:700;font-family:Georgia,serif;">Your reservation has been cancelled${firstName ? `, ${firstName}` : ''}.</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">This email confirms that the booking below has been cancelled. If you didn't request this cancellation or have questions about a refund, please reach out to us right away.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border:1px solid #e8e0d8;border-radius:10px;margin-bottom:22px;">
          <tr>
            <td width="50%" style="padding:20px;border-right:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Original Check-in</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;">${checkInFormatted || '—'}</div>
            </td>
            <td width="50%" style="padding:20px;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Original Check-out</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;">${checkOutFormatted || '—'}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Guests</div>
              <div style="font-size:15px;font-weight:600;color:#2c1810;">${guestsCount ? `${guestsCount} guest${guestsCount > 1 ? 's' : ''}` : '—'}</div>
            </td>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Confirmation #</div>
              <div style="font-size:15px;font-weight:700;color:#1B4F72;">${encodeHTML(confirmationCode || '—')}</div>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:30px;">
          <tr><td style="padding:16px 20px;">
            <div style="font-size:11px;font-weight:700;color:#1e40af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:5px;">&#128176;&nbsp; Refund</div>
            <div style="font-size:14px;color:#1e3a8a;line-height:1.6;">${refundMessage || 'Any refund due will be processed according to our cancellation policy. Refunds typically appear on your card within 5–10 business days.'}</div>
          </td></tr>
        </table>

        <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7;">Still want to stay with us? Browse availability anytime at <a href="https://www.stayroanoke.com" style="color:#1B4F72;font-weight:600;text-decoration:underline;">stayroanoke.com</a> — we'd love to host you.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border-radius:8px;">
          <tr><td style="padding:22px 24px;text-align:center;">
            <div style="font-size:13px;font-weight:700;color:#2c1810;margin-bottom:10px;font-family:Georgia,serif;">Questions about your cancellation?</div>
            <a href="mailto:info@stayroanoke.com" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;display:block;margin-bottom:5px;">info@stayroanoke.com</a>
            <a href="tel:+15407327151" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;">(540) 732-7151</a>
          </td></tr>
        </table>

      </td></tr>

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

async function sendCancellationEmail(reservation) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping cancellation email')
    return
  }

  const guest = reservation.guest || {}
  const email = guest.email
  if (!email) {
    console.warn('No guest email on cancelled reservation — skipping')
    return
  }

  const listing = reservation.listing || {}
  const address = listing.address || {}
  const picture = listing.pictures?.[0]?.original || listing.pictures?.[0]?.thumbnail || ''

  const checkIn  = reservation.checkInDateLocalized  || reservation.checkIn
  const checkOut = reservation.checkOutDateLocalized || reservation.checkOut

  const refundAmount = reservation.money?.refundAmount ?? reservation.refundAmount
  const refundMessage = (typeof refundAmount === 'number' && refundAmount > 0)
    ? `A refund of $${refundAmount.toFixed(2)} will be returned to your original payment method within 5–10 business days.`
    : null

  const html = buildCancellationHtml({
    firstName: guest.firstName || '',
    listingTitle: listing.title || listing.nickname || 'Stay Roanoke Property',
    listingCity: address.city || 'Roanoke',
    listingState: address.state || 'Virginia',
    photoUrl: picture,
    checkInFormatted: formatDate(checkIn),
    checkOutFormatted: formatDate(checkOut),
    guestsCount: reservation.guestsCount || reservation.guests,
    confirmationCode: reservation.confirmationCode || reservation._id,
    refundMessage,
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
      bcc: ['steve@bnbsidekick.com', 'nick@bnbsidekick.com', 'info@stayroanoke.com'],
      subject: `Booking Cancelled – ${listing.title || 'Stay Roanoke'}`,
      html,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`)
  }

  console.log(`✓ Cancellation email sent to ${email} (${reservation.confirmationCode || reservation._id})`)
}

// ─── Status detection ────────────────────────────────────────────────────────
// Guesty's reservation status when cancelled is typically 'canceled' (one l).
// We also accept event-name signals like 'reservation.canceled'.
function isCancellation(payload) {
  const eventName = payload.event || payload.eventType || ''
  if (/cancel/i.test(eventName)) return true
  const status = payload.reservation?.status || payload.status
  return typeof status === 'string' && /cancel/i.test(status)
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: baseHeaders, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const rawBody = event.body || ''

  // Verify signature (no-op if secret not configured, but logs a warning)
  if (!verifySignature(rawBody, event.headers || {})) {
    console.warn('Webhook signature verification failed')
    return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Invalid signature' }) }
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  // Ack non-cancellation events fast — Guesty will retry on non-2xx.
  if (!isCancellation(payload)) {
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: 'not_a_cancellation' }) }
  }

  let reservation = payload.reservation || payload.data?.reservation || null
  const reservationId = reservation?._id || payload.reservationId || payload.data?.reservationId

  if (!reservationId) {
    console.error('Cancellation webhook missing reservation ID:', JSON.stringify(payload).slice(0, 500))
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'No reservation ID' }) }
  }

  // Idempotency: don't double-send if Guesty retries
  if (await alreadySent(reservationId)) {
    console.log(`Cancellation email already sent for ${reservationId} — skipping`)
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: 'already_sent' }) }
  }

  // Fetch full reservation if payload was minimal (missing guest email, dates, etc.)
  if (!reservation?.guest?.email || !reservation?.listing) {
    console.log(`Fetching full reservation ${reservationId} from Guesty`)
    const fetched = await fetchReservation(reservationId)
    if (fetched) reservation = fetched
  }

  if (!reservation) {
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: 'reservation_not_found' }) }
  }

  try {
    await sendCancellationEmail(reservation)
    await markSent(reservationId)
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('Cancellation email send failed:', err.message)
    // Return 500 so Guesty retries — but only briefly; the idempotency check
    // prevents duplicates if the email actually went out before erroring.
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
