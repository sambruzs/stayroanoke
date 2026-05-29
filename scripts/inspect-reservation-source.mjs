// Inspect channel/source-identifying fields on a Guesty reservation.
// Usage:
//   node scripts/inspect-reservation-source.mjs <reservationId> [<reservationId> ...]
//
// Prints the fields likely to distinguish booking-engine reservations from
// OTA reservations (Airbnb, VRBO, Booking.com, etc.) so we can pick the
// right allowlist value for the webhook handler.
import { readFileSync } from 'node:fs'

const CONFIG_PATH = new URL('../.guesty-subaccounts.json', import.meta.url)
const ids = process.argv.slice(2)
if (!ids.length) {
  console.error('Usage: node scripts/inspect-reservation-source.mjs <reservationId> [...]')
  process.exit(1)
}

const { subaccounts } = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))

async function getToken({ clientId, clientSecret }) {
  const res = await fetch('https://open-api.guesty.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'open-api',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) throw new Error(`token ${res.status}`)
  return (await res.json()).access_token
}

async function fetchReservationById(token, id) {
  const res = await fetch(`https://open-api.guesty.com/v1/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

async function fetchReservationByConfirmationCode(token, code) {
  const filters = encodeURIComponent(JSON.stringify([
    { field: 'confirmationCode', operator: '$eq', value: code },
  ]))
  const res = await fetch(`https://open-api.guesty.com/v1/reservations?filters=${filters}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const text = await res.text()
  if (!res.ok) return { ok: false, status: res.status, body: text }
  const parsed = JSON.parse(text)
  const items = parsed.results || parsed.data || (Array.isArray(parsed) ? parsed : [])
  if (!items.length) return { ok: false, status: 404, body: 'no match' }
  return { ok: true, status: 200, body: JSON.stringify(items[0]) }
}

const isObjectId = (s) => /^[a-f0-9]{24}$/i.test(s)

async function fetchReservation(token, idOrCode) {
  return isObjectId(idOrCode)
    ? fetchReservationById(token, idOrCode)
    : fetchReservationByConfirmationCode(token, idOrCode)
}

function pick(r) {
  return {
    _id: r._id,
    source: r.source,
    sourceLabel: r.sourceLabel,
    channel: r.channel,
    platform: r.platform,
    integration: r.integration && {
      platform: r.integration.platform,
      _id: r.integration._id,
    },
    integrationId: r.integrationId,
    bookingEngine: r.bookingEngine,
    confirmationCode: r.confirmationCode,
    status: r.status,
  }
}

for (const id of ids) {
  console.log(`\n═══ ${id} ═══`)
  let found = false
  for (const sub of subaccounts) {
    try {
      const token = await getToken(sub)
      const r = await fetchReservation(token, id)
      if (r.ok) {
        const parsed = JSON.parse(r.body)
        console.log(`✓ found in ${sub.label}`)
        console.log(JSON.stringify(pick(parsed), null, 2))
        found = true
        break
      }
    } catch (e) {
      // try next subaccount
    }
  }
  if (!found) console.log(`✗ not found in any sub-account`)
}
