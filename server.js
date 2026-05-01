import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// HQ Account URLs
const GUESTY_AUTH_URL = 'https://hq-api.guesty.com/oauth2/token'
const GUESTY_API_BASE = 'https://hq-api.guesty.com/booking/api'
const GUESTY_APP_ID = process.env.VITE_GUESTY_APP_ID

const TOKEN_FILE = path.resolve('.guesty-token.json')
let cachedToken = null
let tokenExpiry = null
let tokenPromise = null

function loadTokenFromDisk() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'))
      if (data.token && data.expiry && Date.now() < data.expiry - 300000) {
        cachedToken = data.token
        tokenExpiry = data.expiry
        console.log('✓ Loaded cached token, valid for', Math.round((data.expiry - Date.now()) / 60000), 'more minutes')
        return true
      }
    }
  } catch {}
  return false
}

function saveTokenToDisk(token, expiry) {
  try { fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, expiry })) } catch {}
}

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

      console.log(`Requesting Guesty HQ token (attempt ${attempt}/${retries})...`)

      const res = await fetch(GUESTY_AUTH_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
          'cache-control': 'no-cache,no-cache',
        },
        body: params
      })

      if (res.ok) {
        const data = await res.json()
        cachedToken = data.access_token
        tokenExpiry = Date.now() + data.expires_in * 1000
        saveTokenToDisk(cachedToken, tokenExpiry)
        tokenPromise = null
        console.log(`✓ Token acquired, valid for ${Math.round(data.expires_in / 3600)} hours`)
        return cachedToken
      }

      const errText = await res.text()
      if (res.status === 429 && attempt < retries) {
        const wait = delayMs * attempt
        console.log(`⏳ Rate limited, waiting ${wait / 1000}s...`)
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

if (!loadTokenFromDisk()) {
  getToken().catch(err => console.error('Startup auth error:', err.message))
}

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
        'x-guesty-applicationId': GUESTY_APP_ID,
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
