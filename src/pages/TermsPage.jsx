import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './TermsPage.module.css'

const sections = [
  { id: 'acceptance',       label: 'Acceptance of Terms' },
  { id: 'definitions',      label: 'Definitions' },
  { id: 'eligibility',      label: 'Eligibility & Identification' },
  { id: 'reservations',     label: 'Reservations' },
  { id: 'payment',          label: 'Payment & Fees' },
  { id: 'cancellations',    label: 'Cancellations & Refunds' },
  { id: 'checkin',          label: 'Check-In & Check-Out' },
  { id: 'lockouts',         label: 'Lockouts' },
  { id: 'house-rules',      label: 'House Rules & Conduct' },
  { id: 'hot-tub',          label: 'Hot Tub Policy' },
  { id: 'smoking',          label: 'Smoking, Drugs & Firearms' },
  { id: 'pets',             label: 'Pets & Animals' },
  { id: 'damage',           label: 'Property Damage' },
  { id: 'wifi',             label: 'Wi-Fi & Technology' },
  { id: 'liquidated',       label: 'Liquidated Damages' },
  { id: 'parking',          label: 'Parking & Vehicles' },
  { id: 'surveillance',     label: 'Surveillance & Privacy' },
  { id: 'force-majeure',    label: 'Force Majeure' },
  { id: 'travel-insurance', label: 'Travel Insurance' },
  { id: 'liability',        label: 'Limitation of Liability' },
  { id: 'indemnification',  label: 'Indemnification' },
  { id: 'chargebacks',      label: 'Chargebacks & Disputes' },
  { id: 'arbitration',      label: 'Arbitration' },
  { id: 'governing-law',    label: 'Governing Law' },
  { id: 'general',          label: 'General Provisions' },
  { id: 'contact',          label: 'Contact' },
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

          {/* ── 1. Acceptance ───────────────────────────────────────── */}
          <section id="acceptance" className={styles.section}>
            <h2>1. Acceptance of These Terms</h2>
            <p>These Terms of Service (the "Agreement") form a binding contract between you ("Guest," "you," or "your") and StayRoanoke LLC d/b/a Stay Roanoke ("Operator," "we," "us," or "our"). By making a reservation, completing the online check-in form, electronically signing the Guest Acknowledgement, paying any deposit, or accessing the Property, you confirm that you (a) are at least 21 years old, (b) have read this Agreement in full, (c) have the legal capacity to enter into a binding contract, and (d) agree to it on your own behalf.</p>
            <p>This Agreement incorporates our Privacy Policy, House Rules, and any property-specific information provided at booking. For conflicts between this Agreement and third-party platform terms (e.g., Airbnb, VRBO), the platform terms govern payment and cancellation; for all other conflicts, this Agreement governs. Where this Agreement conflicts with posted House Rules, this Agreement governs.</p>
          </section>

          {/* ── 2. Definitions ──────────────────────────────────────── */}
          <section id="definitions" className={styles.section}>
            <h2>2. Definitions</h2>
            <ul className={styles.rulesList}>
              <li><strong>"Reservation"</strong> means a confirmed booking for a specific Property and date range.</li>
              <li><strong>"Stay"</strong> means the period from check-in to check-out as specified in the Reservation.</li>
              <li><strong>"Booking Channel"</strong> means any third-party platform (including Airbnb, VRBO, Booking.com, or Expedia) through which a Reservation may be made.</li>
              <li><strong>"Authorized Occupant"</strong> means any person listed on the Reservation and approved by Operator to occupy the Property.</li>
              <li><strong>"Property"</strong> means the specific unit, dwelling, or premises reserved by Guest, including all furnishings, appliances, common areas, parking, and exterior areas appurtenant to it.</li>
              <li><strong>"Damage"</strong> means any physical harm to the Property, its furnishings, fixtures, or equipment beyond normal wear and tear.</li>
              <li><strong>"AAA"</strong> means the American Arbitration Association.</li>
              <li><strong>"FAA"</strong> means the Federal Arbitration Act, 9 U.S.C. §§ 1–16.</li>
              <li><strong>"VCPA"</strong> means the Virginia Consumer Protection Act, Va. Code §§ 59.1-196 et seq.</li>
            </ul>
          </section>

          {/* ── 3. Eligibility ──────────────────────────────────────── */}
          <section id="eligibility" className={styles.section}>
            <h2>3. Eligibility, Identification &amp; Transient-Lodging Acknowledgment</h2>

            <h3>3.1 Minimum Age and ID</h3>
            <p>The primary Guest must be at least <strong>21 years of age</strong> and must present a valid government-issued photo ID at or before check-in. Guests under 21 may stay only when accompanied by a parent or legal guardian who is the primary Guest and who is at least 21 years of age.</p>

            <h3>3.2 Capacity and Authority</h3>
            <p>By making a Reservation, you represent that you have the legal capacity and authority to enter into this Agreement, that you are not intoxicated or impaired, and that you are not booking the Property for any unlawful purpose.</p>

            <h3>3.3 Identity Verification</h3>
            <p>You authorize us to verify your identity using the photo ID you provide, the credit card on file, third-party verification services, and the check-in form. Failure to pass identity verification is grounds for cancellation or refusal of check-in under Section 7.5.</p>

            <h3>3.4 Transient Lodging Acknowledgment</h3>
            <p>You acknowledge that your Stay is transient lodging within the meaning of Va. Code §§ 35.1-1 and 55.1-1201(D); that you do not occupy the Property as a primary residence; and that no Stay shall exceed twenty-eight (28) consecutive nights without prior written approval from Operator.</p>

            <h3>3.5 Each Adult Guest Signs Separately</h3>
            <p>Before access codes are issued, every Authorized Occupant who is 18 or older must individually accept this Agreement by completing and electronically signing the Guest Acknowledgement (capturing name, ID, IP address, and timestamp).</p>
          </section>

          {/* ── 4. Reservations ─────────────────────────────────────── */}
          <section id="reservations" className={styles.section}>
            <h2>4. Reservations</h2>

            <h3>4.1 Required at Booking</h3>
            <p>To complete a Reservation you must provide: (a) a valid government-issued photo ID; (b) a valid credit card; (c) working contact information including a current email address and phone number; and (d) acceptance of this Agreement.</p>

            <h3>4.2 Pre-Authorization Hold</h3>
            <p>Consistent with Visa, Mastercard, and American Express rules for the "lodging" merchant category, we may place a pre-authorization hold on the credit card on file for the full Reservation amount, the security deposit, and reasonably anticipated incidentals at any time before, during, or up to thirty (30) days after the Stay. A pre-authorization hold is not a charge — it is a temporary hold that will be released unless actual charges are applied.</p>

            <h3>4.3 Confirmation</h3>
            <p>A Reservation is confirmed when (a) full payment or a required deposit has been received, (b) a confirmation email has been sent to the email address on file, and (c) identity verification has succeeded. Operator reserves the right to cancel an unconfirmed Reservation at any time prior to the issuance of access codes.</p>

            <h3>4.4 Third-Party Booking Channels</h3>
            <p>Reservations made through Airbnb, VRBO, Booking.com, Expedia, or another Booking Channel are also subject to that channel's terms, including its cancellation, payment, and dispute-resolution policies. In the event of a conflict between those terms and this Agreement on payment or cancellation matters, the channel's terms govern.</p>
          </section>

          {/* ── 5. Payment ──────────────────────────────────────────── */}
          <section id="payment" className={styles.section}>
            <h2>5. Payment, Fees &amp; Express Charge Authorization</h2>

            <h3>5.1 All-In Pricing</h3>
            <p>Consistent with the Federal Trade Commission Rule on Unfair or Deceptive Fees (16 C.F.R. Part 464, effective May 12, 2025), the "Total Price" shown at checkout includes all mandatory fees other than government taxes, which are separately itemized.</p>

            <h3>5.2 Charges You Authorize</h3>
            <p>By completing a Reservation you expressly authorize Operator to charge the credit card on file for: (a) the Total Price; (b) any security deposit or damage pre-authorization hold; (c) optional incidentals requested by Guest; (d) Damage charges as described in Section 11; (e) liquidated damages as described in Section 13; (f) excessive cleaning charges as described in Section 11.5; (g) lost rental income as described in Section 11.3; (h) chargeback recovery amounts as described in Section 19; and (i) any other amounts expressly disclosed in this Agreement.</p>

            <h3>5.3 Statement Descriptors</h3>
            <p>Charges may appear on your statement under any of: "Stay Roanoke," "StayRoanoke LLC," "Stay Roanoke Reservations," or "Stay Roanoke Damages."</p>

            <h3>5.4 Notice Before Damage and Liquidated-Damage Charges</h3>
            <p>Before charging you for Damages or liquidated damages under Section 13, we will (a) send an itemized invoice with photo or video evidence to the email address on file, and (b) allow seventy-two (72) hours for you to respond, except as otherwise noted in Section 13.</p>

            <h3>5.5 No-Show</h3>
            <p>A no-show Reservation — meaning no arrival and no timely cancellation — is charged the full Reservation amount. No refund is owed.</p>

            <h3>5.6 Failed Payments</h3>
            <p>If a payment fails, Operator may, at its discretion: (a) refuse check-in; (b) terminate an in-progress Stay; (c) re-attempt the charge; (d) charge an alternative card on file; or (e) refer the outstanding balance to a collections agency, with all reasonable collection costs recoverable from Guest.</p>

            <h3>5.7 Currency</h3>
            <p>All amounts are in U.S. dollars.</p>

            <div className={styles.policyCard}>
              <h3>When You're Charged</h3>
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

          {/* ── 6. Cancellations ────────────────────────────────────── */}
          <section id="cancellations" className={styles.section}>
            <h2>6. Cancellation, Modification &amp; Refund Policy</h2>

            <h3>6.1 Direct Bookings</h3>
            <div className={styles.policyCard}>
              <h3>Standard Cancellation Policy</h3>
              <ul className={styles.policyList}>
                <li>
                  <span className={styles.policyIcon}>✓</span>
                  <div>
                    <strong>Cancel 7 or more days before check-in</strong>
                    <p>Full refund of all amounts paid.</p>
                  </div>
                </li>
                <li>
                  <span className={`${styles.policyIcon} ${styles.policyIconWarn}`}>!</span>
                  <div>
                    <strong>Cancel within 7 days of check-in</strong>
                    <p>A 50% cancellation fee applies. The remaining 50% will be refunded.</p>
                  </div>
                </li>
              </ul>
              <p className={styles.policyNote}>This policy applies to all direct reservations unless otherwise noted at the time of booking.</p>
            </div>

            <h3>6.2 Third-Party Channel Bookings</h3>
            <p>Bookings made through Airbnb, VRBO, Booking.com, Expedia, or another Booking Channel are governed exclusively by that channel's cancellation policy.</p>

            <h3>6.3 Modifications</h3>
            <p>Date, length-of-stay, and unit-change requests are subject to availability and may incur a re-booking fee. Operator is not obligated to accommodate any modification request.</p>

            <h3>6.4 Early Departures</h3>
            <p>If you check out before your scheduled checkout date, you remain liable for the full Reservation amount. No refund is owed for unused nights.</p>

            <h3>6.5 Refund Processing</h3>
            <p>Approved refunds are processed within thirty (30) business days to the original payment method.</p>

            <h3>6.6 Force-Majeure Cancellations by Operator</h3>
            <p>If Operator cancels a Reservation due to a force-majeure event as described in Section 18, pre-paid Stay charges will be refunded less any non-refundable third-party costs already incurred. Operator is not liable for alternative lodging, transportation, or any consequential damages.</p>
          </section>

          {/* ── 7. Check-In / Check-Out ─────────────────────────────── */}
          <section id="checkin" className={styles.section}>
            <h2>7. Check-In, Check-Out &amp; Property Access</h2>

            <div className={styles.timeGrid}>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-In</p>
                <p className={styles.timeValue}>3:00 PM</p>
                <p className={styles.timeNote}>Early check-in is subject to availability ($25 if available).</p>
              </div>
              <div className={styles.timeCard}>
                <p className={styles.timeLabel}>Check-Out</p>
                <p className={styles.timeValue}>11:00 AM</p>
                <p className={styles.timeNote}>Late check-out is subject to availability ($25 if available).</p>
              </div>
            </div>

            <h3>7.1 Online Check-In Form</h3>
            <p>The primary Guest must complete the online check-in form before arrival. Failure to complete the form by 1:00 p.m. Eastern Time on the day of check-in will delay the issuance of access codes. Failure to complete the form by 8:00 p.m. Eastern Time on the day of check-in may result in cancellation of the Reservation without refund.</p>

            <h3>7.2 Door Codes</h3>
            <p>Access codes are issued via SMS and email at or before 3:00 p.m. Eastern Time on the day of check-in. Codes are personal to your Reservation and may not be shared with anyone not listed as an Authorized Occupant. Sharing access codes with unauthorized persons incurs a $250 security violation fee under Section 13.</p>

            <h3>7.3 Check-Out</h3>
            <p>Standard check-out is 11:00 a.m. Eastern Time. Late check-out is subject to availability ($25 if available). Failure to vacate by 11:00 a.m. without an approved late check-out constitutes a holdover, which will be charged at the published nightly rate plus a $50-per-hour holdover charge, billed in one-hour increments.</p>

            <h3>7.4 Checkout Procedures</h3>
            <p>To help our housekeeping team and avoid additional cleaning fees, please complete the following before departing:</p>
            <ul className={styles.rulesList}>
              <li>Dispose of all trash in the provided bins or take it to the outdoor receptacles.</li>
              <li>Wash, dry, and put away your dishes, or load and run the dishwasher.</li>
              <li>Strip the beds and leave used linens on the floor or at the foot of the bed — our cleaners will handle the rest.</li>
              <li>Ensure all doors and windows are locked, lights are off, and the thermostat is set to a reasonable temperature before leaving.</li>
            </ul>

            <h3>7.5 Right to Refuse Service / Self-Help Eviction</h3>
            <p>Operator reserves the right, at its sole discretion, to refuse service, refuse check-in, terminate the Stay, and exercise self-help eviction permitted under Va. Code § 55.1-1201(D) if: (a) any provision of this Agreement is breached; (b) identity verification fails; (c) the Guest's behavior is disruptive, threatening, intoxicated, or unlawful; (d) the Guest refuses to provide a valid credit card or government-issued ID; (e) the Guest exceeds the occupancy limit; or (f) any other reasonable basis exists. No refund is owed upon eviction for cause.</p>
          </section>

          {/* ── Lockouts (Stay Roanoke) ──────────────────────────────── */}
          <section id="lockouts" className={styles.section}>
            <h2>8. Lockouts</h2>
            <p>We use keyless entry at our properties. In the event of a lockout, we will do our best to get you back into your unit as soon as possible.</p>
            <div className={styles.callout}>
              <strong>After-hours lockouts (10:00 PM – 7:00 AM)</strong> are subject to staff availability. We cannot guarantee re-entry during these hours and do not provide 24/7 lockout support or on-site service.
            </div>
          </section>

          {/* ── 9. House Rules ──────────────────────────────────────── */}
          <section id="house-rules" className={styles.section}>
            <h2>9. House Rules &amp; Conduct</h2>

            <h3>9.1 Compliance</h3>
            <p>You and every member of your party must comply with all federal, state, and local laws; all applicable HOA rules; all property-specific rules emailed with your Reservation or posted at the Property; and all reasonable directives from on-site management.</p>

            <h3>9.2 Quiet Hours</h3>
            <p>Quiet hours are <strong>10:00 p.m. to 8:00 a.m.</strong> Excessive noise that draws complaints — at any hour — may result in eviction under Section 7.5. Noise levels must be kept to normal conversational levels during the day. Outdoor music is not permitted after 10:00 p.m.</p>

            <h3>9.3 No Parties or Events</h3>
            <p>The Property is leased for transient lodging only. Parties, gatherings exceeding the Reservation's maximum occupancy, commercial activity (including filming, photography, weddings, receptions, or business meetings exceeding occupancy), and any event that disturbs neighbors are prohibited. Violation results in immediate termination of the Stay without refund and a $1,000 liquidated damages charge under Section 13.</p>

            <h3>9.4 Maximum Occupancy</h3>
            <p>Occupancy is strictly limited to the number of Guests listed on the Reservation and approved at check-in. Unauthorized additional occupants incur a $100 per person per night charge and may result in eviction under Section 7.5.</p>

            <h3>9.5 General Rules</h3>
            <ul className={styles.rulesList}>
              <li>Guests must maintain all property and furnishings in good order and use appliances only for their intended purpose.</li>
              <li>Only Guests listed in the Reservation may stay overnight. All Guests are the sole responsibility of the primary Guest who made the Reservation.</li>
              <li>Guests are responsible for completing a walkthrough and reporting any pre-existing damage promptly upon check-in.</li>
              <li>Guests may not sublet the Property, re-list it on any platform, or otherwise allow third parties to use it beyond those included in the Reservation.</li>
              <li>Illegal activities of any kind are strictly prohibited on the premises and will result in immediate termination of the Reservation without refund.</li>
              <li>Parking is available — contact us for details specific to your unit.</li>
            </ul>
          </section>

          {/* ── Hot Tub (Stay Roanoke) ───────────────────────────────── */}
          <section id="hot-tub" className={styles.section}>
            <h2>10. Hot Tub Policy</h2>
            <p>Properties equipped with a hot tub are subject to the following rules. Failure to comply may result in additional cleaning charges or forfeiture of the damage pre-authorization hold.</p>
            <ul className={styles.rulesList}>
              <li><strong>Shower before entering.</strong> Rinse off before getting in to keep the water clean and chemical levels balanced.</li>
              <li><strong>No glass</strong> of any kind in or around the hot tub. Broken glass requires a full drain, clean, and refill at the Guest's expense.</li>
              <li><strong>No smoking</strong> in or immediately adjacent to the hot tub.</li>
              <li>Children under 12 must be supervised by an adult at all times.</li>
              <li>Do not exceed the posted maximum occupancy for the hot tub.</li>
              <li>Do not add soaps, bath bombs, essential oils, or any foreign substances to the water.</li>
              <li>Replace the cover securely after each use.</li>
              <li>Guests use the hot tub at their own risk. Stay Roanoke assumes no liability for injury or illness resulting from hot tub use.</li>
            </ul>
          </section>

          {/* ── 11. Smoking / Drugs / Firearms ──────────────────────── */}
          <section id="smoking" className={styles.section}>
            <h2>11. Smoking, Vaping, Drugs &amp; Firearms</h2>

            <h3>11.1 No Smoking or Vaping</h3>
            <p>Smoking, vaping, e-cigarette use, hookah, marijuana, cannabis, and any other combustion or vapor-producing inhalation are prohibited inside the unit, on patios or balconies immediately adjacent to the unit, and in all common interior spaces. Violation triggers a <strong>$500 liquidated damages charge</strong> under Section 13.1, plus reimbursement at actual cost for any ozone treatment or extended remediation that exceeds $500.</p>

            <h3>11.2 Illegal Drugs</h3>
            <p>The use, possession, manufacture, or sale of any controlled substance not legally prescribed to the Guest in possession is prohibited and will result in immediate termination of the Stay, eviction, and notification of law enforcement.</p>

            <h3>11.3 Firearms</h3>
            <p>Firearms and other weapons are prohibited on the Property. Pursuant to Va. Code § 18.2-308.01(C), this prohibition is enforceable against concealed-handgun-permit holders.</p>
          </section>

          {/* ── 12. Pets ────────────────────────────────────────────── */}
          <section id="pets" className={styles.section}>
            <h2>12. Service Animals, ESAs &amp; Pets</h2>

            <h3>12.1 Service Animals (ADA)</h3>
            <p>Service animals as defined by the Americans with Disabilities Act (28 C.F.R. § 36.302) are welcome at no additional charge.</p>

            <h3>12.2 Emotional Support Animals</h3>
            <p>Emotional support animals are not service animals under the ADA and are subject to pet fees and restrictions in the same manner as any other pet. For Reservations made through Airbnb or another Booking Channel whose terms require acceptance of ESAs, we comply with that channel's policy.</p>

            <h3>12.3 Pets</h3>
            <p>Pets are permitted with prior written approval and a <strong>$100 non-refundable pet fee per Stay</strong>. All pets must be added to your Reservation via the booking platform or guest portal prior to check-in. Approved pets must be: (a) house-trained; (b) attended at all times when not crated; (c) non-aggressive; and (d) consistent with any applicable HOA pet rules. For Stays over 30 days, a signed pet agreement is required before check-in.</p>

            <h3>12.4 Unauthorized Pets</h3>
            <p>An unauthorized pet triggers the <strong>$250 liquidated damages charge</strong> under Section 13.3, plus the standard $100 pet fee, plus any documented additional Damage.</p>

            <h3>12.5 Animal Liability</h3>
            <p>You are fully responsible for all damage, injury, or claims caused by your animal. You agree to indemnify Operator for any third-party claim arising from your animal.</p>
          </section>

          {/* ── 13. Property Damage ─────────────────────────────────── */}
          <section id="damage" className={styles.section}>
            <h2>13. Property Damage — Assessment &amp; Charges</h2>

            <h3>13.1 Liability</h3>
            <p>You are liable for Damage to the unit, the building, common areas, fixtures, furnishings, equipment, and any item belonging to Operator or to other Guests, that is caused by you, any member of your party, or any invitee.</p>

            <h3>13.2 Assessment</h3>
            <p>Operator, contractors, or property managers will assess Damage within seven (7) calendar days of check-out, except for hidden Damage requiring deeper inspection (water, HVAC, electrical), which may be assessed up to thirty (30) calendar days after the Stay.</p>

            <h3>13.3 What Damage Charges May Include</h3>
            <ul className={styles.rulesList}>
              <li>Actual cost of repair or replacement at current market rates.</li>
              <li>Labor at standard contractor rates.</li>
              <li>Documented lost rental income, capped at the greater of three nights' revenue or 50% of confirmed bookings for the thirty (30) days following the damage event.</li>
              <li>Administrative time at $50 per hour, capped at five (5) hours per incident.</li>
            </ul>

            <h3>13.4 Notice &amp; Evidence</h3>
            <p>Per Section 5.4, you will receive an itemized invoice with photo or video evidence and 72 hours to respond before any Damage charge is processed.</p>

            <h3>13.5 Excessive Cleaning</h3>
            <p>Standard turnover cleaning is included in the cleaning fee disclosed at booking. The following are billed at actual cost plus a $50 administrative fee:</p>
            <ul className={styles.rulesList}>
              <li>Trash exceeding standard household quantities</li>
              <li>Removal of glitter, confetti, slime, or similar materials</li>
              <li>Carpet shampooing for stains</li>
              <li>Smoke or odor remediation (in addition to the Section 13.1 liquidated amount, only to the extent actual cost exceeds it)</li>
              <li>Bodily-fluid biohazard cleanup</li>
              <li>Re-cleaning a unit left in unsanitary condition</li>
              <li>Outside-of-unit cleaning required as a result of Guest activity</li>
            </ul>

            <h3>13.6 Innkeeper's Statutory Lien</h3>
            <p>Pursuant to Va. Code § 43-31, Operator has a lien on baggage and other property left by Guest for unpaid charges.</p>

            <h3>13.7 Statutory Limit on Liability for Guest Property</h3>
            <p>Pursuant to Va. Code § 35.1-28, our liability for loss of, or damage to, your wearing apparel, baggage, or other personal property brought onto the Property is limited to $300 in the aggregate, unless before your Stay you (a) declared a higher value in writing, (b) deposited the items in a safe we provided, and (c) we accepted the higher valuation in writing.</p>
          </section>

          {/* ── 14. Wi-Fi ───────────────────────────────────────────── */}
          <section id="wifi" className={styles.section}>
            <h2>14. Wi-Fi &amp; Technology Acceptable Use</h2>

            <h3>14.1 Acceptable Use</h3>
            <p>You agree not to use the Property's network for: (a) illegal activity, including copyright infringement, unauthorized access to computer systems, or harassment; (b) bulk email, malware distribution, or phishing; (c) bandwidth-intensive cryptocurrency mining or commercial server hosting; or (d) any activity that violates Virginia or federal law.</p>

            <h3>14.2 No Warranty</h3>
            <p>Wi-Fi is provided "as-is" with no guarantee of speed, reliability, security, or availability. No refund or discount is owed for Wi-Fi interruptions.</p>

            <h3>14.3 DMCA / Law-Enforcement Cooperation</h3>
            <p>We may comply with DMCA takedown notices and lawful law-enforcement requests, including disclosing network logs and Guest information as required by law.</p>
          </section>

          {/* ── 15. Liquidated Damages ──────────────────────────────── */}
          <section id="liquidated" className={styles.section}>
            <h2>15. Liquidated Damages — Reasonableness &amp; Exclusivity</h2>
            <p>The parties agree that the following amounts are reasonable estimates of Operator's actual damages for the listed breaches, which are difficult to calculate precisely, and that these amounts are not penalties:</p>

            <div className={styles.policyCard}>
              <ul className={styles.rulesList}>
                <li><strong>Smoking / vaping violation (§ 11.1):</strong> $500, plus reimbursement at actual cost for remediation exceeding $500.</li>
                <li><strong>Unauthorized event, excess occupancy, or quiet-hours breach after warning (§ 9.3):</strong> $1,000.</li>
                <li><strong>Unauthorized pet (§ 12.4):</strong> $250, plus standard pet fee, plus documented additional Damage.</li>
                <li><strong>Guest-count misrepresentation:</strong> $250.</li>
                <li><strong>Sharing access codes with unauthorized persons (§ 7.2):</strong> $250.</li>
                <li><strong>Returned check or chargeback in breach of Section 19:</strong> $75.</li>
              </ul>
            </div>

            <h3>15.1 Smoking-Violation Liquidated Amount</h3>
            <p>$500, payable upon detection by sensor, professional-cleaner odor report, visual evidence, or credible Guest report, plus reimbursement at actual cost for any ozone treatment or remediation that exceeds $500. Not subject to the 72-hour notice in Section 5.4 (the charge is disclosed in advance), but Operator will provide evidence on request.</p>

            <h3>15.2 Party / Excess-Occupancy Liquidated Amount</h3>
            <p>$1,000 for any unauthorized event, gathering exceeding the Reservation's maximum occupancy, or breach of quiet hours after written warning. Subject to the 72-hour notice in Section 5.4.</p>

            <h3>15.3 Unauthorized-Pet Liquidated Amount</h3>
            <p>$250, plus the standard $100 pet fee, plus any documented additional Damage. Subject to the 72-hour notice in Section 5.4.</p>

            <h3>15.4 Exclusivity</h3>
            <p>Each amount listed above is the exclusive liquidated remedy for the specified breach, except where actual damages are shown to exceed the liquidated amount, in which case Operator may recover actual damages.</p>
          </section>

          {/* ── 16. Parking ─────────────────────────────────────────── */}
          <section id="parking" className={styles.section}>
            <h2>16. Parking &amp; Vehicles</h2>

            <h3>16.1 Designated Spaces</h3>
            <p>Vehicles must be parked only in spaces designated to the unit. Unauthorized vehicles may be towed at the vehicle owner's expense without notice. Contact us for parking details specific to your unit.</p>

            <h3>16.2 Vehicle Liability</h3>
            <p>We are not responsible for vehicles or items left in vehicles parked at the Property. You park at your own risk.</p>
          </section>

          {/* ── 17. Surveillance ────────────────────────────────────── */}
          <section id="surveillance" className={styles.section}>
            <h2>17. Surveillance, Privacy &amp; Smart-Lock Disclosures</h2>

            <h3>17.1 No Indoor Cameras or Audio Recording</h3>
            <p>There are no audio or video recording devices inside any guest unit, including bathrooms, bedrooms, and common interior spaces.</p>

            <h3>17.2 Exterior Cameras and Decibel Monitors</h3>
            <p>We operate exterior security cameras at building entrances, hallways, parking areas, and exterior common areas, and a decibel-only noise sensor outside the unit. The decibel sensor records sound levels (numerical readings only), not audio content.</p>

            <h3>17.3 Smart Locks</h3>
            <p>Door codes are unique per Reservation. Each unlock event is logged. You consent to use of these logs as evidence of arrival, occupancy, and the identity of the person using the code, including for chargeback defense, insurance claims, and legal proceedings.</p>

            <h3>17.4 Recording Use</h3>
            <p>Recordings and logs may be retained, reviewed, and used for security, dispute documentation, insurance claims, and law-enforcement matters.</p>

            <h3>17.5 Virginia One-Party Consent</h3>
            <p>Virginia is a one-party consent state under Va. Code § 19.2-62. To the extent any phone or in-person communication between you and Operator is recorded, you consent to such recording where one party (the Operator representative) consents.</p>
          </section>

          {/* ── 18. Force Majeure ───────────────────────────────────── */}
          <section id="force-majeure" className={styles.section}>
            <h2>18. Force Majeure</h2>
            <p>Operator is not liable, and Guest is not entitled to any compensation beyond a refund of pre-paid Stay charges, for any failure or delay in performance due to events beyond our reasonable control, including:</p>
            <ul className={styles.rulesList}>
              <li>Acts of God, severe weather, fire, flood, or earthquake</li>
              <li>Pandemics, epidemics, and government-mandated travel or operational restrictions</li>
              <li>Civil disturbance, terrorism, or war</li>
              <li>Utility outages affecting electricity, water, gas, internet, sewer, or HVAC</li>
              <li>Failures of third-party platforms (Airbnb, Booking.com, Stripe, Guesty, etc.)</li>
              <li>Strikes or supply-chain disruption</li>
              <li>Injunctions or regulatory action</li>
              <li>Any other cause beyond reasonable control</li>
            </ul>
            <div className={styles.callout}>
              <strong>Standard weather events</strong> — including rain, snow, ice, or other routine weather conditions — are <strong>not grounds for a refund</strong>, regardless of their impact on your travel plans. We strongly encourage travel insurance for weather-related protection.
            </div>
          </section>

          {/* ── Travel Insurance (Stay Roanoke) ─────────────────────── */}
          <section id="travel-insurance" className={styles.section}>
            <h2>19. Travel Insurance</h2>
            <p>We strongly recommend that all Guests purchase travel insurance prior to their Stay. Travel insurance can protect you against unexpected cancellations due to illness, injury, travel delays, or other unforeseen circumstances that do not qualify for a refund under our cancellation policy.</p>
            <p>Stay Roanoke is not responsible for losses arising from trip cancellation, interruption, medical emergencies, weather, or other events beyond our control. These situations are <strong>not grounds for a refund</strong> outside of our stated cancellation policy.</p>
          </section>

          {/* ── 20. Limitation of Liability ─────────────────────────── */}
          <section id="liability" className={styles.section}>
            <h2>20. Assumption of Inherent Risks; Limitation of Liability</h2>

            <h3>20.1 Assumption of Inherent Risks</h3>
            <p>You acknowledge that lodging in a vacation rental property carries inherent risks, including but not limited to: stairs and uneven walking surfaces; exposure to weather; variation in hot- and cold-water temperature; kitchen, fireplace, and appliance use; exterior premises hazards; hot tub use; and the ordinary risks of travel.</p>

            <h3>20.2 Personal Injury — No Pre-Injury Release</h3>
            <p>Consistent with Virginia law (including <em>Hiett v. Lake Barcroft Cmty. Ass'n</em>, 244 Va. 191 (1992)), this Agreement does not release Operator from liability for negligence resulting in personal injury or death.</p>

            <h3>20.3 Limitation on Direct Damages</h3>
            <p>EXCEPT FOR (A) PERSONAL INJURY OR DEATH CAUSED BY OPERATOR'S NEGLIGENCE, (B) GROSS NEGLIGENCE OR WILLFUL MISCONDUCT, (C) FRAUD, (D) INDEMNIFICATION OBLIGATIONS, OR (E) ANY LIABILITY THAT CANNOT BY LAW BE LIMITED, EACH PARTY'S TOTAL AGGREGATE LIABILITY FOR DIRECT DAMAGES UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT GUEST ACTUALLY PAID OPERATOR FOR THE STAY GIVING RISE TO THE CLAIM.</p>

            <h3>20.4 Exclusion of Consequential Damages</h3>
            <p>SUBJECT TO THE SAME EXCEPTIONS LISTED IN § 20.3, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST BUSINESS OPPORTUNITY, ALTERNATIVE LODGING COSTS, TRANSPORTATION COSTS, EMOTIONAL DISTRESS, LOST VACATION TIME, OR LOSS OF ENJOYMENT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>

            <h3>20.5 Personal Property</h3>
            <p>Subject to the statutory limit in Section 13.7, we are not responsible for lost, stolen, or damaged personal belongings, including items left in the unit, in vehicles, or in common areas.</p>

            <h3>20.6 Other Guests &amp; Third Parties</h3>
            <p>We are not liable for the acts or omissions of other Guests, contractors, neighbors, third-party platforms, payment processors, smart-lock vendors, or any other third party.</p>

            <h3>20.7 Service Interruptions</h3>
            <p>No refund or discount is owed for temporary interruptions of utilities, Wi-Fi, HVAC, hot water, cleaning service, or any non-essential amenity, unless required by law.</p>

            <h3>20.8 Time to Bring Claims</h3>
            <p>Any non-personal-injury claim arising from this Agreement must be commenced within two (2) years after the claim accrues, except where applicable law requires a longer period (including but not limited to personal-injury claims under Va. Code § 8.01-243 and VCPA claims under Va. Code § 59.1-204.1).</p>
          </section>

          {/* ── 21. Indemnification ─────────────────────────────────── */}
          <section id="indemnification" className={styles.section}>
            <h2>21. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless StayRoanoke LLC, Stay Roanoke, and our owners, members, officers, employees, contractors, agents, and successors, from and against any third-party claim, demand, suit, judgment, settlement, fine, damage, loss, cost, or expense (including reasonable attorneys' fees) arising out of: (a) your acts or omissions, or those of any member of your party or invitee; (b) your breach of this Agreement; (c) your violation of any law; (d) your alleged misrepresentation in connection with the Reservation, check-in, or Stay; or (e) any damage you cause to the Property or to a third party.</p>
          </section>

          {/* ── 22. Chargebacks ─────────────────────────────────────── */}
          <section id="chargebacks" className={styles.section}>
            <h2>22. Pre-Dispute Notice &amp; Chargeback Covenant</h2>

            <h3>22.1 Pre-Dispute Notice</h3>
            <p>Before initiating any chargeback, dispute, or reversal of a charge, you agree to first send written notice of the dispute to <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> and to allow Operator <strong>fourteen (14) calendar days</strong> to investigate and respond.</p>

            <h3>22.2 Breach of the Covenant</h3>
            <p>If you initiate a chargeback without first complying with Section 22.1, you breach this Agreement, and Operator may seek: (a) the disputed amount; (b) the $75 chargeback-recovery liquidated amount under Section 15 (which reasonably forecasts Operator's bank fees, processing time, and administrative cost); and (c) reasonable attorneys' fees and costs in any successful enforcement action.</p>

            <h3>22.3 Evidence Operator May Submit</h3>
            <p>In any payment dispute, Operator may submit as documentation of pre-authorized charges and Guest acceptance: (a) the Reservation confirmation; (b) this Agreement and the Guest Acknowledgement signed by Guest, with timestamp and IP address; (c) the completed online check-in form including ID; (d) smart-lock entry/exit logs; (e) common-area surveillance footage; (f) photo or video evidence of Damage; (g) communications between Guest and Operator; and (h) industry-standard transaction data (AVS, CVV, 3-D Secure, where applicable).</p>

            <h3>22.4 Fraudulent Disputes</h3>
            <p>Knowingly false disputes — including disputing a Stay you took or a charge you authorized — may be referred to law enforcement and to credit-reporting agencies, in addition to civil remedies available to Operator.</p>
          </section>

          {/* ── 23. Arbitration ─────────────────────────────────────── */}
          <section id="arbitration" className={styles.section}>
            <h2>23. Dispute Resolution; Arbitration; Class-Action Waiver</h2>

            <h3>23.1 Informal Resolution First</h3>
            <p>Before initiating arbitration, the claiming party agrees to send a written notice of dispute to the other party (to <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> if to Operator) and to allow thirty (30) calendar days for good-faith resolution.</p>

            <h3>23.2 Mutual Binding Arbitration</h3>
            <p>Except for (i) claims that may be brought in small-claims court and (ii) actions for injunctive or equitable relief described in Section 23.7, any dispute, claim, or controversy arising out of or relating to this Agreement, your Reservation, your Stay, or the Property — whether in contract, tort, statute, fraud, misrepresentation, or any other legal theory — shall be resolved exclusively through final and binding individual arbitration.</p>
            <p>The arbitration shall be administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules and Consumer Due Process Protocol then in effect. The hearing shall take place in or near the City of Roanoke, Virginia, or by remote or desk arbitration for claims under $25,000.</p>

            <h3>23.3 Fees</h3>
            <p>Operator will pay all AAA filing, administrative, and arbitrator fees other than the consumer filing fee capped by the AAA Consumer Rules. For claims under $1,000, Operator will also reimburse the consumer filing fee.</p>

            <h3>23.4 Class-Action and Jury-Trial Waiver</h3>
            <p>YOU AND OPERATOR EACH WAIVE THE RIGHT TO PARTICIPATE IN A CLASS, COLLECTIVE, CONSOLIDATED, MASS, OR REPRESENTATIVE ACTION. ALL CLAIMS MUST BE BROUGHT INDIVIDUALLY. IF FOR ANY REASON A CLAIM IS HEARD IN COURT RATHER THAN IN ARBITRATION, EACH PARTY KNOWINGLY, VOLUNTARILY, AND INTENTIONALLY WAIVES ANY RIGHT TO A JURY TRIAL ON ANY CLAIM ARISING FROM OR RELATING TO THIS AGREEMENT, AS PERMITTED BY VA. CODE § 8.01-336.</p>
            <p>If the class-action waiver in this Section 23.4 is held unenforceable, the entire arbitration agreement in this Section 23 is void, and disputes may proceed in court — but the jury-trial waiver in this Section 23.4 survives and remains enforceable.</p>

            <h3>23.5 Small-Claims-Court Carve-Out</h3>
            <p>Either party may bring an individual claim in small-claims court for any matter within that court's jurisdiction, in lieu of arbitration.</p>

            <h3>23.6 Opt-Out</h3>
            <p>You may opt out of this arbitration agreement by sending written notice — including your name, Reservation reference, and a clear statement that you opt out — to <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a> within thirty (30) calendar days after first accepting this Agreement.</p>

            <h3>23.7 Limited Carve-Out for Injunctive Relief</h3>
            <p>Notwithstanding Section 23.2, either party may bring an action for injunctive or equitable relief in the state or federal courts located in Roanoke, Virginia to: (a) prevent ongoing breach of Sections 9 (House Rules), 11 (Smoking, Drugs, Firearms), or 13 (Property Damage); (b) enforce Operator's innkeeper's lien under Section 13.6; (c) protect intellectual-property rights; or (d) effect self-help eviction under Section 7.5.</p>

            <h3>23.8 Mass-Arbitration Procedure</h3>
            <p>If twenty-five (25) or more substantially similar arbitration demands are filed against Operator within ninety (90) days, the parties shall first try ten (10) bellwether cases under the AAA Mass Arbitration Supplementary Rules then in effect.</p>

            <h3>23.9 Severability</h3>
            <p>If any provision of this Section 23 (other than the class-action waiver) is held unenforceable, the unenforceable provision is severable and the remainder of this Section — including the arbitration agreement, jury-trial waiver, and small-claims carve-out — remains in full force and effect.</p>
          </section>

          {/* ── 24. Governing Law ───────────────────────────────────── */}
          <section id="governing-law" className={styles.section}>
            <h2>24. Governing Law &amp; Venue</h2>

            <h3>24.1 Governing Law</h3>
            <p>This Agreement is governed by the laws of the <strong>Commonwealth of Virginia</strong>, without regard to its conflict-of-laws principles. The Federal Arbitration Act governs the arbitration agreement in Section 23.</p>

            <h3>24.2 Exclusive Venue</h3>
            <p>For any action that is not subject to arbitration (including small-claims and injunctive matters), exclusive venue is the General District or Circuit Court for the City of Roanoke, Virginia.</p>
          </section>

          {/* ── 25. General Provisions ──────────────────────────────── */}
          <section id="general" className={styles.section}>
            <h2>25. General Provisions</h2>

            <h3>25.1 Severability</h3>
            <p>If any provision of this Agreement is held unenforceable, the remainder remains in full force and effect, and the unenforceable provision shall be reformed to the minimum extent necessary to render it enforceable while preserving its intent.</p>

            <h3>25.2 No Waiver</h3>
            <p>Operator's failure to enforce any provision is not a waiver of that provision or of any future enforcement right.</p>

            <h3>25.3 Entire Agreement</h3>
            <p>This Agreement, our Privacy Policy, our House Rules, and the email confirmation of your Reservation constitute the entire agreement between you and Operator and supersede all prior or contemporaneous communications on the same subject.</p>

            <h3>25.4 Assignment</h3>
            <p>You may not assign your rights or obligations under this Agreement. Operator may assign its rights and obligations upon written or email notice to Guest.</p>

            <h3>25.5 Amendments</h3>
            <p>Operator may amend this Agreement at any time. The version in effect on the date of your Reservation governs your Stay. Material changes will be emailed to existing Guests with future Reservations at least seven (7) days before they take effect.</p>

            <h3>25.6 Survival</h3>
            <p>The following sections survive expiration or termination of this Agreement: Section 5 (Payment), Section 13 (Property Damage), Section 15 (Liquidated Damages), Section 20 (Limitation of Liability), Section 21 (Indemnification), Section 22 (Chargebacks), Section 23 (Arbitration), Section 24 (Governing Law), and Section 25 (General Provisions).</p>

            <h3>25.7 Headings; Construction</h3>
            <p>Section headings are for convenience only and do not affect interpretation. The parties acknowledge that this Agreement is the product of mutual review; the rule of construction against the drafter does not apply.</p>
          </section>

          {/* ── 26. Contact ─────────────────────────────────────────── */}
          <section id="contact" className={styles.section}>
            <h2>26. Contact</h2>
            <p>Questions about these Terms or your Reservation:</p>
            <div className={styles.sidebarContact}>
              <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a>
              <a href="tel:+15407327151">(540) 732-7151</a>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>StayRoanoke LLC d/b/a Stay Roanoke — Roanoke, Virginia</p>
            </div>
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
