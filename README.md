# Stay Roanoke

Custom vacation rental booking site for stayroanoke.com, powered by the Guesty Booking Engine API.

## Getting Started

### 1. Install dependencies
```bash
cd stayroanoke
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and add your Guesty Client ID and Client Secret.
Get these from: **Guesty Dashboard → Growth → Distribution → Booking Engine API**

### 3. Run locally
```bash
npm run dev
```
Visit http://localhost:3000

The site runs with **mock data** until real Guesty credentials are added.

## Deploying to Netlify

1. Push this folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and click "Add new site → Import from Git"
3. Select your repo and configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify:
   - `VITE_GUESTY_CLIENT_ID`
   - `VITE_GUESTY_CLIENT_SECRET`
5. Connect your custom domain (stayroanoke.com) in Site Settings → Domain Management

## Project Structure

```
src/
  components/
    Navbar.jsx          # Top navigation with logo
    Footer.jsx          # Site footer
    SearchBar.jsx       # Date/guest search form
    ListingCard.jsx     # Property card for grid views
  pages/
    HomePage.jsx        # Hero + featured listings
    SearchPage.jsx      # All properties + filters
    ListingPage.jsx     # Individual property detail
    CheckoutPage.jsx    # Guest info + booking form
    ConfirmationPage.jsx # Post-booking confirmation
  utils/
    guestyApi.js        # All Guesty API calls
  data/
    mockListings.js     # Sample data for local dev
```

## Guesty API Flow

1. **Auth** — Client credentials → Bearer token (cached 24hr)
2. **Search** — `GET /listings` with checkIn/checkOut/guests filters
3. **Detail** — `GET /listings/:id`
4. **Quote** — `POST /quotes` → price breakdown
5. **Book** — `POST /reservations/instantly` (instant) or `/inquiry`

## Customization

- Brand colors: `src/index.css` CSS variables
- Contact info: Update `Footer.jsx` and `ConfirmationPage.jsx`
- Phone/email: Search for `hello@stayroanoke.com` and `(540) 123-4567`
