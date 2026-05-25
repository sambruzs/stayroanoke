import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import TextUsWidget from './components/TextUsWidget'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const HomePage             = lazy(() => import('./pages/HomePage'))
const SearchPage           = lazy(() => import('./pages/SearchPage'))
const ListingPage          = lazy(() => import('./pages/ListingPage'))
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'))
const ConfirmationPage     = lazy(() => import('./pages/ConfirmationPage'))
const BlogPage             = lazy(() => import('./pages/BlogPage'))
const BlogPostPage         = lazy(() => import('./pages/BlogPostPage'))
const PartnerListingsPage  = lazy(() => import('./pages/PartnerListingsPage'))
const PartnerDetailPage    = lazy(() => import('./pages/PartnerDetailPage'))
const TermsPage            = lazy(() => import('./pages/TermsPage'))
const FAQPage              = lazy(() => import('./pages/FAQPage'))
const ListPropertyPage     = lazy(() => import('./pages/ListPropertyPage'))
const FurnishedRentalsPage = lazy(() => import('./pages/landings/FurnishedRentalsPage'))
const PetFriendlyPage      = lazy(() => import('./pages/landings/PetFriendlyPage'))
const MonthlyRentalsPage   = lazy(() => import('./pages/landings/MonthlyRentalsPage'))
const SalemVAPage          = lazy(() => import('./pages/landings/SalemVAPage'))

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/partners" element={<PartnerListingsPage />} />
            <Route path="/partners/:slug" element={<PartnerDetailPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/list-your-property" element={<ListPropertyPage />} />
            <Route path="/furnished-rentals-roanoke-va" element={<FurnishedRentalsPage />} />
            <Route path="/pet-friendly-rentals-roanoke-va" element={<PetFriendlyPage />} />
            <Route path="/monthly-rentals-roanoke-va" element={<MonthlyRentalsPage />} />
            <Route path="/vacation-rentals-salem-va" element={<SalemVAPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <TextUsWidget />
    </div>
  )
}
