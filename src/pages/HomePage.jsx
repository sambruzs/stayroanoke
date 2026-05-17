import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { getListings } from '../utils/guestyApi'
import styles from './HomePage.module.css'

const TRUST_PILLARS = [
  {
    icon: '🏷️',
    title: 'Best Rate Guaranteed',
    body: 'Book direct and skip the OTA markup. You always get our lowest price — guaranteed.',
  },
  {
    icon: '📍',
    title: 'Local Roanoke Experts',
    body: 'Our team lives here. We know every neighborhood, trail, and hidden gem in the Star City.',
  },
  {
    icon: '✅',
    title: 'Verified Properties',
    body: 'Every listing is personally inspected. No surprises at check-in — just clean, stocked, ready homes.',
  },
  {
    icon: '💬',
    title: 'Real Human Support',
    body: 'Text, call, or email us and a real person responds. No bots, no hold music, no ticket queues.',
  },
]

const FEATURES = [
  { icon: '🏔️', label: 'Blue Ridge Views', url: '/search?tag=Blue+Ridge+Views' },
  { icon: '🥾', label: 'Trail Access',      url: '/search?tag=Trail+Access' },
  { icon: '🍷', label: 'Wine Country',      url: '/search?tag=Wine+Country' },
  { icon: '🛁', label: 'Hot Tubs',          url: '/search?tag=Hot+Tubs' },
  { icon: '🐾', label: 'Pet Friendly',      url: '/search?pets=1' },
  { icon: '👨‍👩‍👧‍👦', label: 'Family Stays',  url: '/search?tag=Family+Stays' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getListings()
        const results = data?.results || data?.data || (Array.isArray(data) ? data : [])
        setFeatured(results.slice(0, 6))
      } catch {
        setFeatured([])
      }
    }
    load()
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Roanoke & Salem, Virginia</p>
          <h1 className={styles.heroTitle}>
            More Than a Stay<br />
            <em>A Home Base</em>
          </h1>
          <p className={styles.heroSub}>
            Safe, verified rentals across Roanoke and beyond
          </p>
          <div className={styles.searchWrap}>
            <SearchBar />
          </div>
        </div>
        <div className={styles.mountainSvg}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C180,80 220,40 360,36 C500,32 540,60 680,54 C820,48 860,20 1000,24 C1140,28 1200,60 1440,52 L1440,120 L0,120 Z" fill="var(--off-white)"/>
          </svg>
        </div>
      </section>

      {/* Feature chips */}
      <section className={styles.features}>
        {FEATURES.map(f => (
          <Link key={f.label} to={f.url} className={styles.featureChip}>
            <span className={styles.featureIcon}>{f.icon}</span>
            <span>{f.label}</span>
          </Link>
        ))}
      </section>

      {/* Featured listings */}
      <section className={styles.listings}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Featured Properties</h2>
          <Link to="/search" className={styles.seeAll}>View all 50+ →</Link>
        </div>
        <div className={styles.grid}>
          {featured.map(listing => (
            <ListingCard key={listing._id || listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Why Book Direct */}
      <section className={styles.bookDirect}>
        <div className={styles.bookDirectInner}>
          <p className={styles.bookDirectEyebrow}>Why Book Direct</p>
          <h2 className={styles.bookDirectTitle}>Skip the middleman. Keep it local.</h2>
          <div className={styles.trustGrid}>
            {TRUST_PILLARS.map(p => (
              <div key={p.title} className={styles.trustCard}>
                <span className={styles.trustIcon}>{p.icon}</span>
                <h3 className={styles.trustTitle}>{p.title}</h3>
                <p className={styles.trustBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Roanoke */}
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.aboutText}>
            <p className={styles.aboutEyebrow}>Why Roanoke?</p>
            <h2 className={styles.aboutTitle}>The Blue Ridge is calling</h2>
            <p className={styles.aboutBody}>
              Roanoke sits at the heart of the Blue Ridge Mountains, surrounded by world-class hiking, 
              Virginia wine country, a thriving culinary scene, and more miles of trails than you can 
              explore in a lifetime. McAfee Knob, the Appalachian Trail, Carvins Cove, and the Blue 
              Ridge Parkway are all minutes away.
            </p>
            <Link to="/search" className={styles.aboutCta}>Browse Properties</Link>
          </div>
          <div className={styles.aboutStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>50+</span>
              <span className={styles.statLabel}>Unique Properties</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>4.9★</span>
              <span className={styles.statLabel}>Average Rating</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>Happy Guests</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
