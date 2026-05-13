import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './TermsPage.module.css'

const sections = [
  { id: 'cancellations', label: 'Cancellations & Refunds' },
  { id: 'payment',       label: 'When You\'re Charged' },
  { id: 'checkin',       label: 'Check-In & Check-Out' },
  { id: 'house-rules',   label: 'House Rules' },
  { id: 'pets',          label: 'Pet Policy' },
  { id: 'lockouts',      label: 'Lockouts' },
  { id: 'refusal',       label: 'Right to Refuse Service' },
]

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions — Stay Roanoke'
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Stay Roanoke</p>
          <h1>Terms &amp; Conditions</h1>
          <p className={styles.heroSub}>Please read these policies before booking. They govern all reservations made through stayroanoke.com.</p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav aria-label="Terms sections">
            <p className={styles.sidebarLabel}>On this page</p>
            <ul>
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.sidebarContact}>
            <p>Questions about our policies?</p>
            <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a>
            <a href="tel:+15407327151">(540) 732-7151</a>
          </div>
        </aside>

        <main className={styles.content}>

          {/* ── Cancellations ───────────────────────────────────── */}
          <section id="cancellations" className={styles.section}>
            <h2>Reservations, Cancellations &amp; Refunds</h2>
            <p>We want to be transparent about how cancellations work. The following is our standard policy for all direct bookings and Booking.com reservations:</p>

            <div className={styles.policyCard}>
              <h3>Standard Cancellation Policy</h3>
              <ul className={styles.policyList}>
                <li>
                  <span className={styles.policyIcon}>✓</span>
                  <div>
                    <strong>Cancel 7 or more days before check-in</strong>
                    <p>Full refund</p>
                  </div>
                </li>
                <li>
                  <span className={styles.policyIcon + ' ' + styles.policyIconWarn}>!</span>
                  <div>
                    <strong>Cancel within 7 days of check-in</strong>
                    <p>50% cancellation fee applies</p>
                  </div>
                </li>
              </ul>
              <p className={styles.policyNote}>This is our standard policy for all direct reservations unless otherwise noted at the time of booking.</p>
            </div>
          </section>

          {/* ── Payment Timing ──────────────────────────────────── */}
          <section id="payment" className={styles.section}>
            <h2>When You're Charged</h2>
            <div className={styles.policyCard}>
              <ul className={styles.policyList}>
                <li>
                  <span className={styles.policyIcon}>📅</span>
                  <div>
                    <strong>Booking made more than 10 days before check-in</strong>
                    <p>Your card is charged in full 10 days before your arrival date, after the cancellation window has closed.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.policyIcon}>⚡</span>
                  <div>
                    <strong>Booking made within 10 days of check-in</strong>
                    <p>Your card is charged in full at the time of booking. No refunds will be issued for cancellations.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* ── Check-In / Check-Out ────────────────────────────── */}
          <section id="checkin" className={styles.section}>
            <h2>Check-In &amp; Check-Out</h2>
            <div className={styles.timeGrid}>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-In</p>
                <p className={styles.timeValue}>3:00 PM</p>
                <p className={styles.timeNote}>Early check-in may be available upon request and with an additional fee. We are happy to accommodate your needs as long as it works with our staff and housekeeping schedules.</p>
              </div>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-Out</p>
                <p className={styles.timeValue}>11:00 AM</p>
                <p className={styles.timeNote}>Late check-out may be available upon request — please inquire with us for cost and availability.</p>
              </div>
            </div>
          </section>

          {/* ── House Rules ─────────────────────────────────────── */}
          <section id="house-rules" className={styles.section}>
            <h2>House Rules</h2>
            <ul className={styles.rulesList}>
              <li>Noise levels must be kept strictly under 60 dBA (normal conversation volume) during the day. Music and excessive noise outdoors must be kept to a respectful minimum at all times. Outdoor music is not permitted after 10:00 PM.</li>
              <li>Building quiet hours are strictly enforced from <strong>10:00 PM – 7:00 AM</strong>.</li>
              <li>No smoking allowed. Evidence of smoking will result in a <strong>$1,500 fine</strong> to cover smoke removal equipment and cleaning.</li>
              <li>Pets are allowed in certain units with the paid pet fee. Unauthorized animals will be charged a <strong>$250 fine</strong> plus the cost of any additional cleaning or damages. See Pet Policy below.</li>
              <li>Parking is available — message us for details specific to your unit.</li>
              <li>Parties, events, and disruptive behavior will not be tolerated. If neighbors are disturbed, we reserve the right to ask the guest to vacate the premises with no refund.</li>
              <li>Guests must maintain all property and furnishings in good order and use appliances only for their intended purpose.</li>
              <li>Only guests listed in the reservation may stay overnight. All guests are the sole responsibility of the renter who made the reservation.</li>
              <li>Guests may not exceed the agreed-upon occupancy limit.</li>
              <li>Guests are responsible for doing a walkthrough and reporting any pre-existing damage upon entering the property.</li>
            </ul>
          </section>

          {/* ── Pet Policy ──────────────────────────────────────── */}
          <section id="pets" className={styles.section}>
            <h2>Pet Policy</h2>
            <p>We're happy to welcome pets at our properties! To ensure a smooth stay for everyone, please note the following:</p>
            <ul className={styles.rulesList}>
              <li>All pets must be added to your reservation via the booking platform or guest portal <strong>prior to check-in</strong>.</li>
              <li><strong>Service animals</strong> are always welcome and are not subject to pet fees in accordance with the ADA.</li>
              <li><strong>Emotional Support Animals (ESAs)</strong> are not considered service animals under the Americans with Disabilities Act and are subject to pet fees and restrictions, just like any other pet.</li>
              <li>For reservations over 30 days, a signed pet agreement is required before check-in. We'll provide the form after booking.</li>
            </ul>
          </section>

          {/* ── Lockouts ────────────────────────────────────────── */}
          <section id="lockouts" className={styles.section}>
            <h2>Lockouts</h2>
            <p>We use keyless entry at our properties. In the event of a lockout, we will do our best to get you back into your unit as soon as possible.</p>
            <div className={styles.callout}>
              <strong>After-hours lockouts (10:00 PM – 7:00 AM)</strong> are subject to staff availability. We cannot guarantee re-entry during these hours and do not provide 24/7 lockout support or on-site service.
            </div>
          </section>

          {/* ── Right to Refuse ─────────────────────────────────── */}
          <section id="refusal" className={styles.section}>
            <h2>Right to Refuse Service &amp; Reservation Termination</h2>
            <p>The Company reserves the sole and absolute right, at its discretion, to deny accommodations, refuse service, or terminate any current or future reservation of any guest whose conduct has, in the Company's judgment:</p>
            <ul className={styles.rulesList}>
              <li>Violated posted house rules</li>
              <li>Caused unreasonable wear, damage, or unsanitary conditions to the premises</li>
              <li>Created disturbances or otherwise interfered with the quiet enjoyment or safety of other guests, neighbors, or staff</li>
            </ul>
            <p>In such circumstances, the Company may immediately cancel the reservation and issue a full refund of unrented nights, and the guest may be prohibited from making future reservations at any Company-managed property.</p>
            <p>Any exercise of this right shall be applied in a manner consistent with all applicable federal, Commonwealth of Virginia, and local laws, including but not limited to the Virginia Fair Housing Law and federal Fair Housing Act. Decisions will not be made on the basis of any protected class, including race, color, religion, national origin, sex, familial status, disability, elderliness, or any other characteristic protected under applicable law.</p>
            <p>The guest acknowledges that the Company's determination regarding violations of policies or unacceptable conduct shall be final and binding for purposes of enforcing this provision.</p>
          </section>

          <div className={styles.footer}>
            <p>Last updated May 2026. Questions? <a href="mailto:info@stayroanoke.com">Email us</a> or call <a href="tel:+15407327151">(540) 732-7151</a>.</p>
            <Link to="/search" className={styles.browseBtn}>Browse Properties</Link>
          </div>

        </main>
      </div>
    </div>
  )
}
