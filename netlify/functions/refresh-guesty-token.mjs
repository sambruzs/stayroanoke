import { fetchFreshToken } from './guesty.mjs'

// Runs every day at 5am UTC (1am ET) — well before token expiry
// Uses 1 of the 5 daily OAuth calls, leaving 4 in reserve
export const config = { schedule: '0 5 * * *' }

export default async () => {
  console.log('⏰ Scheduled Guesty token refresh starting...')
  try {
    await fetchFreshToken()
    console.log('✓ Scheduled refresh complete')
  } catch (err) {
    // Log clearly — this will surface in Netlify function logs
    console.error('✗ Scheduled refresh FAILED:', err.message)
    // Don't throw — a failed scheduled function that throws will not retry
  }
}
