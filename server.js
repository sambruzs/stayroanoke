import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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
        console.log(`✓ Guesty token acquired (attempt ${attempt}), expires in`, Math.round(data.expires_in / 60), 'minutes')
        return cachedToken
      }

      const errText = await res.text()
      if (res.status === 429 && attempt < retries) {
        const wait = delayMs * attempt
        console.log(`⏳ Rate limited (429), waiting ${wait / 1000}s before retry ${attempt + 1}/${retries}...`)
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

getToken().catch(err => console.error('Startup auth error:', err.message))

app.all('/api/*', async (req, res) => {
  try {
    const token = await getToken()
    const guestyPath = req.path.replace('/api', '')
    const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
    const url = `${GUESTY_API_BASE}${guestyPath}${queryString}`

    console.log(`→ ${req.method} ${url}`)

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json; charset=utf-8',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    console.error('Proxy error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✓ Stay Roanoke proxy running at http://localhost:${PORT}`)
})
