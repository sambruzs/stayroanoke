import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ListPropertyPage.module.css'

const TRUST_ITEMS = [
  'Roanoke-Based Team',
  'Real-Time Owner Reporting',
  'Fully Hands-Off or Flexible — You Choose',
  'Personal Service, Not a Call Center',
]

const PERKS = [
  {
    icon: '🚫',
    title: 'No Nickel & Diming',
    body: 'No hidden fees or markups on supplies and maintenance. What we quote is what you pay.',
  },
  {
    icon: '📞',
    title: 'Direct Team Access',
    body: 'You have a real local contact — not a ticket system. Reach our team directly, any time.',
  },
  {
    icon: '📅',
    title: 'Flexible Owner Calendar',
    body: 'Block dates for personal use whenever you want. Your home, your schedule.',
  },
  {
    icon: '📊',
    title: 'Owner Portal',
    body: 'See your bookings, revenue, and statements in real time through your owner dashboard.',
  },
]

const PACKAGES = [
  {
    name: 'Full Management',
    desc: 'We handle everything. You collect a check.',
    items: [
      'Multi-platform listing & marketing',
      'Dynamic pricing & revenue management',
      'Guest screening, communication & support',
      'Professional housekeeping after every stay',
      'Maintenance coordination',
      'Professional photography',
      'Owner portal with real-time reporting',
    ],
    popular: true,
  },
  {
    name: 'Flexible Management',
    desc: 'Stay involved as much or as little as you like.',
    items: [
      'Choose the services you need',
      'Keep control of your calendar',
      'Mix self-management with our support',
      'Scale up or down at any time',
    ],
    popular: false,
  },
]

const BENEFITS = [
  {
    icon: '📣',
    title: 'Multi-Channel Marketing',
    body: 'Your property listed across Airbnb, VRBO, Booking.com, and our direct booking site — all managed in one place.',
  },
  {
    icon: '🧹',
    title: 'Professional Housekeeping',
    body: 'Our vetted cleaning teams turn over your property to a consistent standard after every guest.',
  },
  {
    icon: '📸',
    title: 'Professional Photography',
    body: 'We coordinate high-quality photos that make your listing stand out and book faster.',
  },
  {
    icon: '💰',
    title: 'Revenue Management',
    body: 'Dynamic pricing based on local demand, seasonality, and market data to maximize your nightly rate.',
  },
  {
    icon: '🛎️',
    title: 'Guest Screening & Support',
    body: 'We handle all guest communication, ID verification, and support so you don\'t have to.',
  },
  {
    icon: '🔧',
    title: 'Maintenance Coordination',
    body: 'Issues get flagged and resolved fast — we have a network of trusted local vendors on call.',
  },
]

const STEPS = [
  { num: '01', title: 'Tell us about your property', body: 'Fill out the short form below with your property details and contact info.' },
  { num: '02', title: 'We\'ll reach out within 24 hours', body: 'A member of our local team will get in touch to learn more and answer your questions.' },
  { num: '03', title: 'We assess and onboard', body: 'We walk the property, take care of photos, and get your listing live — usually within a week.' },
  { num: '04', title: 'Guests start booking', body: 'Sit back while we handle the marketing, guests, and day-to-day operations.' },
]

const SIZE_OPTIONS = [
  { label: 'Studio / 1 BR', low: 25000, high: 35000 },
  { label: '2 – 3 BR', low: 45000, high: 65000 },
  { label: '4 – 5 BR', low: 75000, high: 100000 },
]

const ADDONS = [
  { key: 'hottub', label: 'Hot Tub or Sauna', icon: '♨️', bonus: 10000 },
  { key: 'views', label: 'Mountain or City Views', icon: '🏔️', bonus: 10000 },
  { key: 'luxury', label: 'Luxury Furnishings / Design', icon: '✨', bonus: 10000 },
]

function fmt(n) {
  return '$' + n.toLocaleString()
}

function RevenueEstimator() {
  const [sizeIdx, setSizeIdx] = useState(1)
  const [addons, setAddons] = useState({ hottub: false, views: false, luxury: false })

  const base = SIZE_OPTIONS[sizeIdx]
  const bonus = ADDONS.reduce((sum, a) => sum + (addons[a.key] ? a.bonus : 0), 0)
  const low = base.low + bonus
  const high = base.high + bonus

  return (
    <div className={styles.estimator}>
      <div className={styles.estimatorLeft}>
        <div className={styles.estimatorGroup}>
          <p className={styles.estimatorLabel}>Property size</p>
          <div className={styles.sizeButtons}>
            {SIZE_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                className={`${styles.sizeBtn} ${sizeIdx === i ? styles.sizeBtnActive : ''}`}
                onClick={() => setSizeIdx(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.estimatorGroup}>
          <p className={styles.estimatorLabel}>Premium features</p>
          <div className={styles.addonList}>
            {ADDONS.map(a => (
              <label key={a.key} className={`${styles.addonItem} ${addons[a.key] ? styles.addonActive : ''}`}>
                <input
                  type="checkbox"
                  checked={addons[a.key]}
                  onChange={() => setAddons(prev => ({ ...prev, [a.key]: !prev[a.key] }))}
                  className={styles.addonCheckbox}
                />
                <span className={styles.addonIcon}>{a.icon}</span>
                <span className={styles.addonText}>{a.label}</span>
                <span className={styles.addonBonus}>+{fmt(a.bonus)}/yr</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.estimatorRight}>
        <p className={styles.estimatorResultLabel}>Estimated Annual Revenue</p>
        <p className={styles.estimatorResult}>{fmt(low)} – {fmt(high)}</p>
        <p className={styles.estimatorResultSub}>per year, based on Roanoke market data</p>
        <a
          href={`mailto:info@stayroanoke.com?subject=Income Estimate Request`}
          className={styles.estimatorCta}
        >
          Get My Personalized Estimate →
        </a>
      </div>
    </div>
  )
}

export default function ListPropertyPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', bedrooms: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const mailto = `mailto:info@stayroanoke.com?subject=List My Property — ${encodeURIComponent(form.address || 'New Inquiry')}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nProperty Address: ${form.address}\nBedrooms: ${form.bedrooms}\n\nNotes:\n${form.notes}`
    )}`
    window.location.href = mailto
    setSubmitted(true)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Partner With Us</p>
          <h1>List Your Property</h1>
          <p className={styles.heroSub}>
            Join Roanoke's most trusted short-term rental network. We handle everything — you collect the income.
          </p>
        </div>
      </div>

      {/* Trust bar */}
      <div className={styles.trustBar}>
        {TRUST_ITEMS.map((item, i) => (
          <React.Fragment key={item}>
            <span className={styles.trustItem}>{item}</span>
            {i < TRUST_ITEMS.length - 1 && <span className={styles.trustDot}>·</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Benefits */}
      <section className={styles.benefits}>
        <div className={styles.benefitsInner}>
          <p className={styles.sectionEyebrow}>What we handle</p>
          <h2 className={styles.sectionTitle}>Full-service management, local expertise</h2>
          <div className={styles.benefitsGrid}>
            {BENEFITS.map(b => (
              <div key={b.title} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{b.icon}</span>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitBody}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <p className={styles.sectionEyebrow}>The process</p>
          <h2 className={styles.sectionTitle}>Up and running in about a week</h2>
          <div className={styles.steps}>
            {STEPS.map(s => (
              <div key={s.num} className={styles.step}>
                <span className={styles.stepNum}>{s.num}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepBody}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner perks */}
      <section className={styles.perks}>
        <div className={styles.perksInner}>
          <p className={styles.sectionEyebrow}>Owner benefits</p>
          <h2 className={styles.sectionTitle}>Built around you, not just your guests</h2>
          <div className={styles.perksGrid}>
            {PERKS.map(p => (
              <div key={p.title} className={styles.perkCard}>
                <span className={styles.perkIcon}>{p.icon}</span>
                <h3 className={styles.perkTitle}>{p.title}</h3>
                <p className={styles.perkBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className={styles.packages}>
        <div className={styles.packagesInner}>
          <p className={styles.sectionEyebrow}>Management options</p>
          <h2 className={styles.sectionTitle}>Your property, your level of involvement</h2>
          <div className={styles.packagesGrid}>
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={styles.packageCard}>
                {pkg.popular && <span className={styles.packageBadge}>Most Popular</span>}
                <h3 className={styles.packageName}>{pkg.name}</h3>
                <p className={styles.packageDesc}>{pkg.desc}</p>
                <ul className={styles.packageList}>
                  {pkg.items.map(item => (
                    <li key={item}><span className={styles.packageCheck}>✓</span>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner listings */}
      <section className={styles.partnerBanner}>
        <div className={styles.partnerBannerInner}>
          <div className={styles.partnerBannerText}>
            <p className={styles.sectionEyebrow} style={{ color: 'var(--tan)' }}>Another option</p>
            <h2 className={styles.partnerBannerTitle}>Already self-managing? Partner with us.</h2>
            <p className={styles.partnerBannerBody}>
              Partner Listings are designed for owners who want the marketing reach and brand credibility of the
              Stay Roanoke platform — without handing over day-to-day management. Your property gets listed on
              our site and benefits from our marketing, while you stay in full control of operations, housekeeping,
              and guest relations.
            </p>
            <a
              href="mailto:info@stayroanoke.com?subject=Partner Listing Inquiry"
              className={styles.partnerBannerLink}
            >
              Learn more about Partner Listings →
            </a>
          </div>
          <div className={styles.partnerBannerCard}>
            <h3 className={styles.partnerCardTitle}>Partner Listing includes</h3>
            <ul className={styles.partnerCardList}>
              <li><span>✓</span> Featured on stayroanoke.com</li>
              <li><span>✓</span> Stay Roanoke marketing & branding</li>
              <li><span>✓</span> Direct booking through our platform</li>
              <li><span>✓</span> You keep full management control</li>
              <li><span>✓</span> You set your own rates & availability</li>
            </ul>
            <a
              href="mailto:info@stayroanoke.com?subject=Partner Listing Inquiry"
              className={styles.partnerCardBtn}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Revenue estimator */}
      <section id="estimator" className={styles.estimatorSection}>
        <div className={styles.estimatorInner}>
          <p className={styles.sectionEyebrow}>Earning potential</p>
          <h2 className={styles.sectionTitle}>See how much your property could earn</h2>
          <p className={styles.estimatorIntro}>
            Based on real Roanoke & Salem market data. Select your property size and any premium features to get a quick estimate.
          </p>
          <RevenueEstimator />
        </div>
      </section>

      {/* Contact form */}
      <section className={styles.formSection}>
        <div className={styles.formInner}>
          <div className={styles.formLeft}>
            <p className={styles.sectionEyebrow}>Get started</p>
            <h2 className={styles.sectionTitle}>Tell us about your property</h2>
            <p className={styles.formIntro}>
              We're selective about the properties we take on — every listing in our network is personally vetted.
              Fill out the form and we'll be in touch within 24 hours.
            </p>
            <div className={styles.formContact}>
              <p>Prefer to talk first?</p>
              <a href="sms:+15407327151">(540) 732-7151</a>
              <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a>
            </div>
          </div>

          <div className={styles.formRight}>
            {submitted ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}>✓</span>
                <h3>We'll be in touch soon!</h3>
                <p>Your email client should have opened with your inquiry. If not, email us directly at <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a>.</p>
                <Link to="/" className={styles.successBtn}>Back to Home</Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label htmlFor="name">Your Name *</label>
                    <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Jane Smith" />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@email.com" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(540) 555-1234" />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <select id="bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4 Bedrooms</option>
                      <option value="5+">5+ Bedrooms</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formField}>
                  <label htmlFor="address">Property Address *</label>
                  <input id="address" name="address" type="text" required value={form.address} onChange={handleChange} placeholder="123 Main St, Roanoke, VA" />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="notes">Anything else you'd like us to know?</label>
                  <textarea id="notes" name="notes" rows={4} value={form.notes} onChange={handleChange} placeholder="Current status, rental history, questions..." />
                </div>
                <button type="submit" className={styles.submitBtn}>Send Inquiry →</button>
                <p className={styles.formNote}>We typically respond within 24 hours.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
