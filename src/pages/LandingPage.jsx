import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import { getListings } from '../utils/guestyApi'
import { HIDDEN_LISTING_IDS } from '../data/hiddenListings'
import styles from './LandingPage.module.css'

export default function LandingPage({
  meta,       // { title, description }
  hero,       // { eyebrow, heading, sub }
  sections,   // [{ heading, body }]
  faqs,       // [{ q, a }]
  filterFn,   // optional: (listing) => bool
  searchUrl,  // e.g. '/search?pets=1'
  searchLabel,
}) {
  const [listings, setListings] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getListings()
        const raw = data?.results || data?.data || (Array.isArray(data) ? data : [])
        const filtered = raw
          .filter(l => !HIDDEN_LISTING_IDS.has(l._id || l.id))
          .filter(l => filterFn ? filterFn(l) : true)
        setListings(filtered.slice(0, 6))
      } catch {
        setListings([])
      }
    }
    load()
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1>{hero.heading}</h1>
          <p className={styles.heroSub}>{hero.sub}</p>
          <Link to={searchUrl} className={styles.heroCta}>{searchLabel || 'Browse Properties →'}</Link>
        </div>
      </section>

      {/* Body sections */}
      {sections?.length > 0 && (
        <section className={styles.body}>
          <div className={styles.bodyInner}>
            {sections.map(s => (
              <div key={s.heading} className={styles.bodySection}>
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured listings */}
      {listings.length > 0 && (
        <section className={styles.listings}>
          <div className={styles.listingsInner}>
            <h2>Available Properties</h2>
            <div className={styles.grid}>
              {listings.map(l => (
                <ListingCard key={l._id || l.id} listing={l} />
              ))}
            </div>
            <div className={styles.listingsCta}>
              <Link to={searchUrl} className={styles.viewAll}>View All Properties →</Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs?.length > 0 && (
        <section className={styles.faq}>
          <div className={styles.faqInner}>
            <h2>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {faqs.map(({ q, a }) => (
                <div key={q} className={styles.faqItem}>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2>Ready to book your Roanoke stay?</h2>
          <p>Browse all available properties and book direct for the best rate — guaranteed.</p>
          <Link to={searchUrl} className={styles.ctaBtn}>{searchLabel || 'Browse Properties →'}</Link>
        </div>
      </section>
    </div>
  )
}
