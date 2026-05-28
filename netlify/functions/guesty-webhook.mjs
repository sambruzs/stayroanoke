// Guesty webhook receiver — sends branded transactional emails via Resend
// for reservation lifecycle events:
//   - Cancellation:  status flips to 'canceled' → cancellation email with
//                    cancellation policy + computed refund tier
//   - Modification:  guest-visible field changes (dates, guests, pets, total)
//                    → modification email summarising what changed
//   - Other updates: silently acked (no email)
//
// Configure in Guesty (per sub-account):
//   Use scripts/register-cancellation-webhook.mjs to register the same URL
//   on every sub-account that owns properties sold via the booking engine.
//   Event subscription: reservation.updated (fires on any change incl. cancel)
//
// Env vars required:
//   RESEND_API_KEY           — same key used by confirmation emails
//   GUESTY_WEBHOOK_SECRET    — verifies HMAC signature
//   GUESTY_CLIENT_ID, GUESTY_CLIENT_SECRET — used to fetch full reservation
//                              detail if the webhook payload is minimal
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

const BCC_LIST = ['steve@bnbsidekick.com', 'nick@bnbsidekick.com', 'info@stayroanoke.com']

// ─── Blobs stores ────────────────────────────────────────────────────────────
function reservationStore() {
  const token = process.env.NETLIFY_TOKEN
  if (token) return getStore({ name: 'reservation-state', siteID: NETLIFY_SITE_ID, token })
  return getStore('reservation-state')
}

async function loadState(reservationId) {
  try {
    return await reservationStore().get(reservationId, { type: 'json' })
  } catch { return null }
}

async function saveState(reservationId, state) {
  try {
    await reservationStore().set(reservationId, JSON.stringify(state))
  } catch (e) {
    console.warn('State persist failed:', e.message)
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

// ─── Guesty API helpers ──────────────────────────────────────────────────────
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
  return (await res.json()).access_token
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

// ─── Field extraction (defensive against payload variations) ─────────────────
function extractCore(reservation) {
  return {
    checkIn:  reservation.checkInDateLocalized  || reservation.checkIn  || '',
    checkOut: reservation.checkOutDateLocalized || reservation.checkOut || '',
    guests:   reservation.guestsCount ?? reservation.guests ?? null,
    pets:     reservation.petsCount ?? reservation.pets ?? 0,
    total:    reservation.money?.totalFare ?? reservation.money?.netAmount ?? reservation.totalPrice ?? null,
    status:   reservation.status || '',
  }
}

function diffCore(prev, curr) {
  if (!prev) return null
  const changes = {}
  for (const key of ['checkIn', 'checkOut', 'guests', 'pets', 'total']) {
    if (String(prev[key] ?? '') !== String(curr[key] ?? '')) {
      changes[key] = { from: prev[key], to: curr[key] }
    }
  }
  return Object.keys(changes).length ? changes : null
}

// ─── Cancellation policy logic ───────────────────────────────────────────────
function cancellationPolicyTier(checkInISO) {
  if (!checkInISO) return null
  const checkInDate = new Date(checkInISO.length === 10 ? checkInISO + 'T16:00:00' : checkInISO)
  const now = new Date()
  const hoursUntilCheckIn = (checkInDate - now) / 3_600_000

  if (hoursUntilCheckIn >= 168) { // 7 days
    return {
      key: 'full',
      headline: 'Full refund applies',
      detail: 'Your reservation was cancelled more than 7 days before check-in. Per our cancellation policy, a full refund will be issued to your original payment method.',
    }
  }
  if (hoursUntilCheckIn > 0) {
    return {
      key: 'partial',
      headline: '50% refund applies',
      detail: 'Your reservation was cancelled within 7 days of check-in. Per our cancellation policy, a 50% cancellation fee applies and the remaining 50% of stay charges will be refunded to your original payment method.',
    }
  }
  return {
    key: 'none',
    headline: 'No refund per policy',
    detail: 'Your reservation was cancelled on or after the day of check-in. Per our cancellation policy, no refund is due.',
  }
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

function formatMoney(n) {
  if (typeof n !== 'number') return ''
  return `$${n.toFixed(2)}`
}

function formatField(key, value) {
  if (value == null || value === '') return '—'
  if (key === 'checkIn' || key === 'checkOut') return formatDate(value)
  if (key === 'total') return formatMoney(value)
  return String(value)
}

const FIELD_LABELS = {
  checkIn:  'Check-in',
  checkOut: 'Check-out',
  guests:   'Guests',
  pets:     'Pets',
  total:    'Total',
}

function heroBlock({ photoUrl, listingTitle, listingCity, listingState, grayscale = false }) {
  const filter = grayscale ? 'filter:grayscale(40%);' : ''
  return photoUrl ? `
      <tr><td style="padding:0;position:relative;line-height:0;">
        <div style="position:relative;display:block;">
          <img src="${photoUrl}" width="600" alt="${listingTitle}" style="display:block;width:100%;max-width:600px;height:300px;object-fit:cover;border:0;${filter}" />
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
}

function brandHeader() {
  return `<tr><td style="background-color:#1B4F72;padding:22px 40px;text-align:center;">
    <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.14em;font-family:Georgia,serif;">STAY ROANOKE</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:0.22em;margin-top:4px;text-transform:uppercase;">Trusted Local Stays in Virginia's Blue Ridge</div>
  </td></tr>`
}

function brandFooter(year) {
  return `<tr><td style="background-color:#152d3f;padding:22px 40px;text-align:center;">
    <div style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.8;">
      &copy; ${year} Stay Roanoke &nbsp;&middot;&nbsp; Roanoke, Virginia<br />
      <a href="https://www.stayroanoke.com/terms" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Terms &amp; Conditions</a>
      &nbsp;&middot;&nbsp;
      <a href="https://www.stayroanoke.com" style="color:rgba(255,255,255,0.35);text-decoration:underline;">stayroanoke.com</a>
    </div>
  </td></tr>`
}

function contactBlock(headline = 'Questions? We actually pick up the phone.') {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border-radius:8px;">
    <tr><td style="padding:22px 24px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#2c1810;margin-bottom:10px;font-family:Georgia,serif;">${headline}</div>
      <a href="mailto:info@stayroanoke.com" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;display:block;margin-bottom:5px;">info@stayroanoke.com</a>
      <a href="tel:+15407327151" style="color:#1B4F72;font-size:14px;font-weight:600;text-decoration:none;">(540) 732-7151</a>
    </td></tr>
  </table>`
}

// ─── Cancellation email ──────────────────────────────────────────────────────
function buildCancellationHtml(raw) {
  const { photoUrl, checkInFormatted, checkOutFormatted, guestsCount, confirmationCode, refundAmount, policyTier, year } = raw
  const firstName    = encodeHTML(raw.firstName)
  const listingTitle = encodeHTML(raw.listingTitle)
  const listingCity  = encodeHTML(raw.listingCity)
  const listingState = encodeHTML(raw.listingState)

  const tierColor = policyTier?.key === 'full'    ? '#1a5c38'
                  : policyTier?.key === 'partial' ? '#b45309'
                  : '#7a2e2e'
  const refundLine = (typeof refundAmount === 'number' && refundAmount > 0)
    ? `<div style="font-size:13px;color:#1e3a8a;margin-top:6px;line-height:1.5;">Refund amount on file: <strong>${formatMoney(refundAmount)}</strong>. Refunds typically post to your card within 5–10 business days.</div>`
    : `<div style="font-size:13px;color:#1e3a8a;margin-top:6px;line-height:1.5;">Refunds typically post to your card within 5–10 business days.</div>`

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Booking Cancelled – Stay Roanoke</title></head>
<body style="margin:0;padding:0;background-color:#f0ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ece6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.12);">
      ${brandHeader()}
      ${heroBlock({ photoUrl, listingTitle, listingCity, listingState, grayscale: true })}
      <tr><td style="background-color:#7a2e2e;padding:14px 40px;text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.12em;text-transform:uppercase;">&#10006;&nbsp;&nbsp;Booking Cancelled</div>
      </td></tr>
      <tr><td style="background-color:#ffffff;padding:40px;">

        <h1 style="margin:0 0 10px;font-size:27px;color:#2c1810;font-weight:700;font-family:Georgia,serif;">Your reservation has been cancelled${firstName ? `, ${firstName}` : ''}.</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">This email confirms the cancellation of the booking below. The refund tier shown is computed from when this cancellation was processed relative to your original check-in date.</p>

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

        ${policyTier ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:18px;">
          <tr><td style="padding:18px 20px;">
            <div style="font-size:11px;font-weight:700;color:#1e40af;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">&#128176;&nbsp; Refund</div>
            <div style="font-size:15px;font-weight:700;color:${tierColor};margin-bottom:4px;">${policyTier.headline}</div>
            <div style="font-size:14px;color:#1e3a8a;line-height:1.6;">${policyTier.detail}</div>
            ${refundLine}
          </td></tr>
        </table>` : ''}

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border:1px solid #e8e0d8;border-radius:8px;margin-bottom:30px;">
          <tr><td style="padding:18px 20px;">
            <div style="font-size:11px;font-weight:700;color:#2c1810;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Cancellation Policy Summary</div>
            <div style="font-size:13px;color:#4b5563;line-height:1.7;">
              &bull;&nbsp;<strong>More than 7 days</strong> before check-in: full refund<br />
              &bull;&nbsp;<strong>7 days or less</strong> before check-in: 50% cancellation fee, 50% refund<br />
              &bull;&nbsp;<strong>On or after</strong> the check-in date: no refund
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-top:10px;line-height:1.6;">Full policy at <a href="https://www.stayroanoke.com/terms#cancellations" style="color:#1B4F72;text-decoration:underline;">stayroanoke.com/terms</a>.</div>
          </td></tr>
        </table>

        <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7;">Still want to stay with us? Browse availability anytime at <a href="https://www.stayroanoke.com" style="color:#1B4F72;font-weight:600;text-decoration:underline;">stayroanoke.com</a> — we'd love to host you another time.</p>

        ${contactBlock('Questions about your cancellation?')}

      </td></tr>
      ${brandFooter(year)}
    </table>
  </td></tr>
</table>
</body></html>`
}

// ─── Modification email ──────────────────────────────────────────────────────
function buildModificationHtml(raw) {
  const { photoUrl, confirmationCode, changes, current, guestPortalUrl, year } = raw
  const firstName    = encodeHTML(raw.firstName)
  const listingTitle = encodeHTML(raw.listingTitle)
  const listingCity  = encodeHTML(raw.listingCity)
  const listingState = encodeHTML(raw.listingState)

  const changesRows = Object.entries(changes).map(([key, { from, to }]) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:30%;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;font-size:11px;">${FIELD_LABELS[key] || key}</td>
          <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#9ca3af;text-decoration:line-through;width:35%;">${encodeHTML(formatField(key, from))}</td>
          <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#1B4F72;font-weight:700;width:35%;">${encodeHTML(formatField(key, to))}</td>
        </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Reservation Updated – Stay Roanoke</title></head>
<body style="margin:0;padding:0;background-color:#f0ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ece6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.12);">
      ${brandHeader()}
      ${heroBlock({ photoUrl, listingTitle, listingCity, listingState })}
      <tr><td style="background-color:#1B4F72;padding:14px 40px;text-align:center;">
        <div style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.12em;text-transform:uppercase;">&#9998;&nbsp;&nbsp;Reservation Updated</div>
      </td></tr>
      <tr><td style="background-color:#ffffff;padding:40px;">

        <h1 style="margin:0 0 10px;font-size:27px;color:#2c1810;font-weight:700;font-family:Georgia,serif;">Your reservation has been updated${firstName ? `, ${firstName}` : ''}.</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">Here's a summary of what changed. If you didn't expect this update, contact us right away.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:18px 22px;">
            <div style="font-size:11px;font-weight:700;color:#92400e;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">What changed</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <th style="text-align:left;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;padding-bottom:8px;">Field</th>
                <th style="text-align:left;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;padding-bottom:8px;">Previous</th>
                <th style="text-align:left;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;padding-bottom:8px;">Updated</th>
              </tr>
              ${changesRows}
            </table>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f0;border:1px solid #e8e0d8;border-radius:10px;margin-bottom:24px;">
          <tr>
            <td width="50%" style="padding:20px;border-right:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Check-in</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;">${formatDate(current.checkIn) || '—'}</div>
            </td>
            <td width="50%" style="padding:20px;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Check-out</div>
              <div style="font-size:15px;font-weight:700;color:#2c1810;">${formatDate(current.checkOut) || '—'}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Guests</div>
              <div style="font-size:15px;font-weight:600;color:#2c1810;">${current.guests ? `${current.guests} guest${current.guests > 1 ? 's' : ''}${current.pets > 0 ? ` · ${current.pets} pet${current.pets > 1 ? 's' : ''}` : ''}` : '—'}</div>
            </td>
            <td style="padding:16px 20px;border-top:1px solid #e8e0d8;vertical-align:top;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;">Confirmation #</div>
              <div style="font-size:15px;font-weight:700;color:#1B4F72;">${encodeHTML(confirmationCode || '—')}</div>
            </td>
          </tr>
        </table>

        ${guestPortalUrl ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
          <tr><td align="center">
            <a href="${guestPortalUrl}" style="display:inline-block;background-color:#1B4F72;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.04em;">View Your Stay &rarr;</a>
          </td></tr>
        </table>` : ''}

        ${contactBlock('Questions about your reservation?')}

      </td></tr>
      ${brandFooter(year)}
    </table>
  </td></tr>
</table>
</body></html>`
}

// ─── Senders ─────────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Stay Roanoke <bookings@stayroanoke.com>',
      to: [to],
      bcc: BCC_LIST,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`)
  }
}

function commonEmailContext(reservation) {
  const guest = reservation.guest || {}
  const listing = reservation.listing || {}
  const address = listing.address || {}
  return {
    firstName: guest.firstName || '',
    email: guest.email,
    listingTitle: listing.title || listing.nickname || 'Stay Roanoke Property',
    listingCity: address.city || 'Roanoke',
    listingState: address.state || 'Virginia',
    photoUrl: listing.pictures?.[0]?.original || listing.pictures?.[0]?.thumbnail || '',
    confirmationCode: reservation.confirmationCode || reservation._id,
    year: new Date().getFullYear(),
  }
}

async function sendCancellationEmail(reservation) {
  const ctx = commonEmailContext(reservation)
  if (!ctx.email) { console.warn('No guest email — skipping cancellation email'); return }

  const checkIn  = reservation.checkInDateLocalized  || reservation.checkIn
  const checkOut = reservation.checkOutDateLocalized || reservation.checkOut
  const refundAmount = reservation.money?.refundAmount ?? reservation.refundAmount

  const html = buildCancellationHtml({
    ...ctx,
    checkInFormatted: formatDate(checkIn),
    checkOutFormatted: formatDate(checkOut),
    guestsCount: reservation.guestsCount || reservation.guests,
    refundAmount: typeof refundAmount === 'number' ? refundAmount : null,
    policyTier: cancellationPolicyTier(checkIn),
  })

  await sendEmail({
    to: ctx.email,
    subject: `Booking Cancelled – ${ctx.listingTitle}`,
    html,
  })
  console.log(`✓ Cancellation email sent to ${ctx.email} (${ctx.confirmationCode})`)
}

async function sendModificationEmail(reservation, changes) {
  const ctx = commonEmailContext(reservation)
  if (!ctx.email) { console.warn('No guest email — skipping modification email'); return }

  const current = extractCore(reservation)

  // Build guest portal URL the same way the confirmation email does
  const portalToken = Buffer.from('{{guest_app::stay_roanoke_all}}').toString('base64')
  const guestPortalUrl = `https://guest-app.guesty.com/r/${reservation._id}/${portalToken}`

  const html = buildModificationHtml({
    ...ctx,
    changes,
    current,
    guestPortalUrl,
  })

  await sendEmail({
    to: ctx.email,
    subject: `Reservation Updated – ${ctx.listingTitle}`,
    html,
  })
  console.log(`✓ Modification email sent to ${ctx.email} (${ctx.confirmationCode}) — changes: ${Object.keys(changes).join(',')}`)
}

// ─── Status detection ────────────────────────────────────────────────────────
function isCancellation(reservation, payload) {
  const eventName = payload.event || payload.eventType || ''
  if (/cancel/i.test(eventName)) return true
  const status = reservation?.status || payload.status
  return typeof status === 'string' && /cancel/i.test(status)
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: baseHeaders, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const rawBody = event.body || ''
  if (!verifySignature(rawBody, event.headers || {})) {
    console.warn('Webhook signature verification failed')
    return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Invalid signature' }) }
  }

  let payload
  try { payload = JSON.parse(rawBody) }
  catch { return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) } }

  let reservation = payload.reservation || payload.data?.reservation || null
  const reservationId = reservation?._id || payload.reservationId || payload.data?.reservationId
  if (!reservationId) {
    console.error('Webhook missing reservation ID:', JSON.stringify(payload).slice(0, 500))
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'No reservation ID' }) }
  }

  // Fetch full reservation if payload is minimal
  if (!reservation?.guest?.email || !reservation?.listing) {
    const fetched = await fetchReservation(reservationId)
    if (fetched) reservation = fetched
  }
  if (!reservation) {
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: 'reservation_not_found' }) }
  }

  const prevState = await loadState(reservationId)
  const currState = extractCore(reservation)

  // ── Cancellation ───────────────────────────────────────────────────────────
  if (isCancellation(reservation, payload)) {
    if (prevState?.cancellationEmailSent) {
      console.log(`Cancellation email already sent for ${reservationId} — skipping`)
      return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: 'cancellation_already_sent' }) }
    }
    try {
      await sendCancellationEmail(reservation)
      await saveState(reservationId, { ...currState, cancellationEmailSent: true, lastSeen: new Date().toISOString() })
      return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, sent: 'cancellation' }) }
    } catch (err) {
      console.error('Cancellation email failed:', err.message)
      return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) }
    }
  }

  // ── Modification (or first-seen) ───────────────────────────────────────────
  const changes = diffCore(prevState, currState)
  if (!changes) {
    // No watched-field change (or no prior state — first webhook for this reservation).
    // Just store state for future comparisons.
    await saveState(reservationId, { ...currState, lastSeen: new Date().toISOString() })
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, skipped: prevState ? 'no_relevant_change' : 'first_seen' }) }
  }

  try {
    await sendModificationEmail(reservation, changes)
    await saveState(reservationId, { ...currState, lastSeen: new Date().toISOString() })
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true, sent: 'modification', changedFields: Object.keys(changes) }) }
  } catch (err) {
    console.error('Modification email failed:', err.message)
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) }
  }
}
