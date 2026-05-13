import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './TermsPage.module.css'

const sections = [
  { id: 'cancellations',  label: 'Cancellations & Refunds' },
  { id: 'payment',        label: 'When You\'re Charged' },
  { id: 'damage-deposit', label: 'Damage Pre-Authorization' },
  { id: 'age',            label: 'Minimum Age' },
  { id: 'checkin',        label: 'Check-In & Check-Out' },
  { id: 'checkout-proc',  label: 'Checkout Procedures' },
  { id: 'house-rules',    label: 'House Rules' },
  { id: 'hot-tub',        label: 'Hot Tub Policy' },
  { id: 'pets',           label: 'Pet Policy' },
  { id: 'lockouts',       label: 'Lockouts' },
  { id: 'cameras',        label: 'Security Cameras' },
  { id: 'prohibited',     label: 'Prohibited Activities' },
  { id: 'mail',           label: 'Mail & Packages' },
  { id: 'lost-found',     label: 'Lost & Found' },
  { id: 'travel-insurance', label: 'Travel Insurance' },
  { id: 'force-majeure',  label: 'Force Majeure' },
  { id: 'liability',      label: 'Limitation of Liability' },
  { id: 'refusal',        label: 'Right to Refuse Service' },
  { id: 'governing-law',  label: 'Governing Law' },
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
            <p>The following is our standard policy for all direct bookings:</p>
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
                  <span className={`${styles.policyIcon} ${styles.policyIconWarn}`}>!</span>
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

          {/* ── Damage Pre-Auth ─────────────────────────────────── */}
          <section id="damage-deposit" className={styles.section}>
            <h2>Damage Pre-Authorization Hold</h2>
            <p>A pre-authorization hold will be placed on the credit card on file at or prior to check-in. This is <strong>not a charge</strong> — it is a temporary hold to cover any accidental damage that may occur during your stay.</p>
            <div className={styles.callout}>
              The hold amount varies by property and will be clearly communicated prior to your arrival. The pre-authorization is released within <strong>5–7 business days</strong> after check-out, provided no damage has been reported. If damages are found, the cost of repair or replacement will be charged against the hold, and any excess charged to the card on file.
            </div>
            <p>Guests are responsible for any damage beyond normal wear and tear, including but not limited to broken furnishings, stained linens, excessive cleaning requirements, or damage caused by unauthorized pets or guests.</p>
          </section>

          {/* ── Minimum Age ─────────────────────────────────────── */}
          <section id="age" className={styles.section}>
            <h2>Minimum Booking Age</h2>
            <p>The primary guest making the reservation must be at least <strong>21 years of age</strong>. By completing a booking, you confirm that you meet this requirement. Stay Roanoke reserves the right to cancel any reservation where the primary guest cannot verify they are 21 or older, with no refund issued.</p>
          </section>

          {/* ── Check-In / Check-Out ────────────────────────────── */}
          <section id="checkin" className={styles.section}>
            <h2>Check-In &amp; Check-Out</h2>
            <div className={styles.timeGrid}>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-In</p>
                <p className={styles.timeValue}>3:00 PM</p>
                <p className={styles.timeNote}>Early check-in may be available upon request and with an additional fee, subject to housekeeping availability.</p>
              </div>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-Out</p>
                <p className={styles.timeValue}>11:00 AM</p>
                <p className={styles.timeNote}>Late check-out may be available upon request — please inquire for cost and availability.</p>
              </div>
            </div>
          </section>

          {/* ── Checkout Procedures ─────────────────────────────── */}
          <section id="checkout-proc" className={styles.section}>
            <h2>Checkout Procedures</h2>
            <p>To help our housekeeping team and avoid additional cleaning fees, please complete the following before departing:</p>
            <ul className={styles.rulesList}>
              <li>Dispose of all trash in the provided bins or take it to the outdoor receptacles.</li>
              <li>Wash, dry, and put away your dishes, or load and run the dishwasher.</li>
              <li>Strip the beds and leave used linens on the floor or at the foot of the bed if time permits — our cleaners will handle the rest.</li>
              <li>Ensure all doors and windows are locked, lights are off, and the thermostat is set to a reasonable temperature before leaving.</li>
            </ul>
            <p>Our cleaners handle everything else. Excessive mess beyond normal use may result in an additional cleaning charge.</p>
          </section>

          {/* ── House Rules ─────────────────────────────────────── */}
          <section id="house-rules" className={styles.section}>
            <h2>House Rules</h2>
            <ul className={styles.rulesList}>
              <li>Noise levels must be kept strictly under 60 dBA (normal conversation volume) during the day. Music and excessive noise outdoors must be kept to a respectful minimum at all times. Outdoor music is not permitted after 10:00 PM.</li>
              <li>Building quiet hours are strictly enforced from <strong>10:00 PM – 7:00 AM</strong>.</li>
              <li>No smoking of any kind is permitted inside the property. Evidence of indoor smoking will result in a <strong>$1,500 fine</strong> to cover odor removal and cleaning.</li>
              <li>Pets are allowed in certain units with the paid pet fee. Unauthorized animals will be charged a <strong>$250 fine</strong> plus the cost of any additional cleaning or damages. See Pet Policy below.</li>
              <li>Parking is available — message us for details specific to your unit.</li>
              <li>Parties, events, and disruptive behavior will not be tolerated. If neighbors are disturbed, we reserve the right to ask the guest to vacate the premises with no refund.</li>
              <li>Guests must maintain all property and furnishings in good order and use appliances only for their intended purpose.</li>
              <li>Only guests listed in the reservation may stay overnight. All guests are the sole responsibility of the renter who made the reservation.</li>
              <li>Guests may not exceed the agreed-upon occupancy limit.</li>
              <li>Guests are responsible for completing a walkthrough and reporting any pre-existing damage upon entering the property.</li>
              <li>Illegal activities of any kind are strictly prohibited on the premises and will result in immediate termination of the reservation without refund.</li>
              <li>Guests may not sublet the property, re-list it on any platform, or otherwise allow third parties to use it beyond those included in the reservation.</li>
            </ul>
          </section>

          {/* ── Hot Tub ─────────────────────────────────────────── */}
          <section id="hot-tub" className={styles.section}>
            <h2>Hot Tub Policy</h2>
            <p>Properties equipped with a hot tub are subject to the following rules. Failure to comply may result in additional cleaning charges or loss of the damage pre-authorization hold.</p>
            <ul className={styles.rulesList}>
              <li><strong>Shower before entering.</strong> Rinse off before getting in to keep the water clean and chemical levels balanced.</li>
              <li><strong>No glass</strong> of any kind in or around the hot tub. Broken glass in a hot tub requires a full drain, clean, and refill at the guest's expense.</li>
              <li><strong>No smoking</strong> in or immediately adjacent to the hot tub.</li>
              <li>Children under 12 must be supervised by an adult at all times.</li>
              <li>Maximum occupancy is posted on or near the unit — do not exceed it.</li>
              <li>Do not add soaps, bath bombs, essential oils, or any foreign substances to the water.</li>
              <li>Replace the cover securely after each use.</li>
              <li>Guests use the hot tub at their own risk. Stay Roanoke assumes no liability for injury or illness resulting from hot tub use.</li>
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

          {/* ── Security Cameras ────────────────────────────────── */}
          <section id="cameras" className={styles.section}>
            <h2>Security Cameras</h2>
            <p>All Stay Roanoke properties are equipped with <strong>exterior security cameras</strong>. These cameras monitor outdoor areas only — entryways, parking areas, and building exteriors — and are in place for the safety and security of our guests and properties.</p>
            <p>There are <strong>no cameras of any kind inside any property</strong>. Interior surveillance is strictly prohibited under our management standards and applicable Virginia law.</p>
          </section>

          {/* ── Prohibited Activities ───────────────────────────── */}
          <section id="prohibited" className={styles.section}>
            <h2>Prohibited Activities</h2>
            <ul className={styles.rulesList}>
              <li><strong>Illegal activities</strong> — The use, possession, or distribution of illegal substances or any activity that violates federal, state, or local law is strictly prohibited and will result in immediate eviction without refund.</li>
              <li><strong>Subletting &amp; unauthorized re-rental</strong> — Guests may not sublet, re-list, or transfer occupancy of the property to any third party not included in the original reservation.</li>
              <li><strong>Commercial photography &amp; video production</strong> — Professional or commercial photo shoots and video productions require prior written approval. Please <a href="mailto:info@stayroanoke.com">contact us</a> to arrange.</li>
              <li><strong>Events &amp; parties</strong> — Organized gatherings beyond the registered guest count are prohibited without prior written approval.</li>
            </ul>
          </section>

          {/* ── Mail & Packages ─────────────────────────────────── */}
          <section id="mail" className={styles.section}>
            <h2>Mail &amp; Packages</h2>
            <p>Mail and package delivery service is <strong>not offered at any Stay Roanoke property</strong> and is explicitly prohibited. Do not use a Stay Roanoke property address for personal or business mail, subscriptions, or deliveries of any kind.</p>
            <div className={styles.callout}>
              If you need to receive a package during your stay, please use one of the following local services: <strong>Amazon Hub Lockers</strong>, a <strong>USPS PO Box</strong>, or your nearest <strong>FedEx or UPS store</strong> for hold-for-pickup.
            </div>
            <p>Any mail or packages delivered to a property will be held by our cleaning or management team but Stay Roanoke assumes no liability for their safety, condition, or timely retrieval.</p>
          </section>

          {/* ── Lost & Found ────────────────────────────────────── */}
          <section id="lost-found" className={styles.section}>
            <h2>Lost &amp; Found</h2>
            <p>Stay Roanoke is not responsible for any personal items lost, forgotten, or left behind at a property. We will make a reasonable effort to have our cleaning crew identify and secure items found after checkout.</p>
            <ul className={styles.rulesList}>
              <li>To inquire about a lost item, email <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> within 14 days of checkout with a description of the item and your reservation details.</li>
              <li>Found items will only be returned by mail after <strong>return shipping and handling fees are paid in advance</strong>. We will provide a shipping quote upon request.</li>
              <li>Items not claimed within 30 days of checkout will be donated or disposed of.</li>
            </ul>
          </section>

          {/* ── Travel Insurance ────────────────────────────────── */}
          <section id="travel-insurance" className={styles.section}>
            <h2>Travel Insurance</h2>
            <p>We strongly recommend that all guests purchase travel insurance prior to their stay. Travel insurance can protect you against unexpected cancellations due to illness, injury, travel delays, or other unforeseen circumstances that do not qualify for a refund under our cancellation policy.</p>
            <p>Stay Roanoke is not responsible for losses arising from trip cancellation, interruption, medical emergencies, weather, or other events beyond our control. These situations are <strong>not grounds for a refund</strong> outside of our stated cancellation policy.</p>
          </section>

          {/* ── Force Majeure ───────────────────────────────────── */}
          <section id="force-majeure" className={styles.section}>
            <h2>Force Majeure</h2>
            <p>A full refund will be issued to the guest only in the following circumstances:</p>
            <ul className={styles.rulesList}>
              <li>A <strong>state of emergency is officially declared</strong> by federal, Commonwealth of Virginia, or local authorities that directly prevents travel to or occupancy of the property; or</li>
              <li>The property is deemed <strong>uninhabitable</strong> due to damage, utility failure, or a condition beyond the guest's control that makes it unsafe or unusable for the reserved dates.</li>
            </ul>
            <div className={styles.callout}>
              <strong>Standard weather events</strong> — including rain, snow, ice, or other routine weather conditions — are <strong>not grounds for a refund</strong>, regardless of their impact on your travel plans. We strongly encourage travel insurance for weather-related protection.
            </div>
            <p>In all other cases, our standard cancellation policy applies.</p>
          </section>

          {/* ── Limitation of Liability ─────────────────────────── */}
          <section id="liability" className={styles.section}>
            <h2>Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, Stay Roanoke, its owners, managers, employees, and agents shall not be liable for any injury, illness, loss, damage, or expense of any kind — including but not limited to:</p>
            <ul className={styles.rulesList}>
              <li>Personal injury or illness sustained during your stay, on the property, or in common areas</li>
              <li>Loss, theft, or damage to personal property brought to or left at the property</li>
              <li>Interruption of services such as internet, utilities, or amenities beyond our reasonable control</li>
              <li>Acts of third parties, neighbors, or other guests</li>
              <li>Conditions arising from force majeure events as described above</li>
            </ul>
            <p>By completing a reservation, the guest agrees to assume all risks associated with their stay and to indemnify and hold harmless Stay Roanoke, its property owners, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from the guest's use of the property or violation of these terms.</p>
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
            <p>Any exercise of this right shall be applied in a manner consistent with all applicable federal, Commonwealth of Virginia, and local laws, including but not limited to the Virginia Fair Housing Law and federal Fair Housing Act. Decisions will not be made on the basis of any protected class.</p>
          </section>

          {/* ── Governing Law ───────────────────────────────────── */}
          <section id="governing-law" className={styles.section}>
            <h2>Governing Law</h2>
            <p>These Terms &amp; Conditions and any disputes arising from a reservation or stay at a Stay Roanoke property shall be governed by and construed in accordance with the laws of the <strong>Commonwealth of Virginia</strong>, without regard to its conflict of law provisions. Any legal proceedings shall be brought exclusively in the courts of the Commonwealth of Virginia.</p>
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
