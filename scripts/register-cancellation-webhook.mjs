// Register the cancellation webhook on every Guesty sub-account.
//
// Guesty's webhook subscriptions live at the sub-account level, not at the
// booking-engine level. So if your booking engine pulls listings from N
// sub-accounts, you need N webhook subscriptions — all pointing at the same
// Netlify function URL.
//
// Setup:
//   1. cp .guesty-subaccounts.example.json .guesty-subaccounts.json
//   2. Fill in clientId/clientSecret for each sub-account's Open API
//      integration (create one per sub-account inside Guesty admin).
//   3. node scripts/register-cancellation-webhook.mjs
//
// The script:
//   - Reads sub-account creds from .guesty-subaccounts.json (gitignored)
//   - Generates ONE shared webhook secret (or reuses WEBHOOK_SECRET env)
//   - Registers the webhook on each sub-account via Open API
//   - Prints the secret at the end — copy to Netlify as GUESTY_WEBHOOK_SECRET
//
// Modes:
//   node scripts/register-cancellation-webhook.mjs            (register)
//   node scripts/register-cancellation-webhook.mjs --list     (list existing)
//   node scripts/register-cancellation-webhook.mjs --delete <webhookId>  (one)
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

const CONFIG_PATH = new URL('../.guesty-subaccounts.json', import.meta.url)

let config
try {
  config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
} catch (e) {
  console.error(`✗ Could not read .guesty-subaccounts.json — copy .guesty-subaccounts.example.json and fill it in.`)
  console.error(`  (${e.message})`)
  process.exit(1)
}

const { webhookUrl, events, subaccounts } = config
if (!webhookUrl || !Array.isArray(events) || !Array.isArray(subaccounts) || !subaccounts.length) {
  console.error('✗ Config missing webhookUrl, events, or subaccounts.')
  process.exit(1)
}

const mode = process.argv[2] || 'register'

// ── Token + API helpers ───────────────────────────────────────────────────
async function getOpenApiToken({ clientId, clientSecret }) {
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
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`token ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.access_token
}

async function createWebhook(token, secret) {
  const res = await fetch('https://open-api.guesty.com/v1/webhooks', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, events, secret, isActive: true }),
  })
  const text = await res.text()
  return { ok: res.ok, status: res.status, body: text }
}

async function listWebhooks(token) {
  const res = await fetch('https://open-api.guesty.com/v1/webhooks', {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

async function deleteWebhook(token, id) {
  const res = await fetch(`https://open-api.guesty.com/v1/webhooks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

// ── Modes ─────────────────────────────────────────────────────────────────
async function modeRegister() {
  const secret = process.env.WEBHOOK_SECRET || randomBytes(24).toString('hex')
  console.log(`Webhook URL:    ${webhookUrl}`)
  console.log(`Events:         ${events.join(', ')}`)
  console.log(`Shared secret:  ${secret}`)
  console.log()

  const results = []
  for (const sub of subaccounts) {
    process.stdout.write(`→ ${sub.label}... `)
    try {
      const token = await getOpenApiToken(sub)
      const r = await createWebhook(token, secret)
      if (r.ok) {
        const parsed = JSON.parse(r.body)
        console.log(`✓ created (id: ${parsed._id || parsed.id || '?'})`)
        results.push({ sub: sub.label, ok: true, id: parsed._id || parsed.id })
      } else {
        console.log(`✗ ${r.status}: ${r.body.slice(0, 200)}`)
        results.push({ sub: sub.label, ok: false, status: r.status, body: r.body })
      }
    } catch (e) {
      console.log(`✗ ${e.message}`)
      results.push({ sub: sub.label, ok: false, error: e.message })
    }
  }

  const ok = results.filter(r => r.ok).length
  console.log()
  console.log(`Registered ${ok}/${results.length} sub-account webhooks.`)
  if (ok === results.length) {
    console.log()
    console.log('Next steps:')
    console.log(`  1. Add to Netlify env vars: GUESTY_WEBHOOK_SECRET=${secret}`)
    console.log(`  2. Test by cancelling a reservation; check function logs.`)
  }
}

async function modeList() {
  for (const sub of subaccounts) {
    console.log(`\n→ ${sub.label}`)
    try {
      const token = await getOpenApiToken(sub)
      const r = await listWebhooks(token)
      if (r.ok) {
        const data = JSON.parse(r.body)
        const items = data.results || data.data || (Array.isArray(data) ? data : [])
        if (!items.length) { console.log('  (no webhooks)'); continue }
        for (const w of items) {
          console.log(`  ${w._id || w.id}  ${w.url}  events=${(w.events || []).join(',')}  active=${w.isActive}`)
        }
      } else {
        console.log(`  ✗ ${r.status}: ${r.body.slice(0, 200)}`)
      }
    } catch (e) {
      console.log(`  ✗ ${e.message}`)
    }
  }
}

async function modeDelete(id) {
  if (!id) {
    console.error('Usage: node scripts/register-cancellation-webhook.mjs --delete <webhookId>')
    process.exit(1)
  }
  // We don't know which sub-account owns it; try each until one succeeds.
  for (const sub of subaccounts) {
    try {
      const token = await getOpenApiToken(sub)
      const r = await deleteWebhook(token, id)
      if (r.ok) {
        console.log(`✓ deleted ${id} via ${sub.label}`)
        return
      }
      console.log(`  ${sub.label}: ${r.status}`)
    } catch (e) {
      console.log(`  ${sub.label}: ${e.message}`)
    }
  }
  console.error(`✗ could not delete ${id} from any sub-account.`)
}

// ── Main ─────────────────────────────────────────────────────────────────
if (mode === '--list') {
  await modeList()
} else if (mode === '--delete') {
  await modeDelete(process.argv[3])
} else {
  await modeRegister()
}
