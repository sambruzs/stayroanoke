import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './FAQPage.module.css'

const FAQS = [
  {
    category: 'Booking & Cancellation',
    icon: '📅',
    questions: [
      {
        q: 'What is the minimum stay?',
        a: 'All properties require a minimum of 2 nights.',
      },
      {
        q: 'What is the minimum age to book?',
        a: 'The primary guest must be at least 21 years old and provide a valid government-issued photo ID at or before check-in.',
      },
      {
        q: 'What is your cancellation policy?',
        a: 'For direct bookings: cancel 7 or more days before check-in for a full refund. Cancel within 7 days of check-in and a 50% cancellation fee applies. Bookings made within 10 days of check-in are charged in full at booking and are non-refundable. See our full Terms & Conditions for details.',
      },
      {
        q: 'How long can I stay?',
        a: 'Stays up to 89 consecutive nights are available. For stays of 30 nights or more, discounted rates apply — contact us for details.',
      },
    ],
  },
  {
    category: 'Check-In & Check-Out',
    icon: '🔑',
    questions: [
      {
        q: 'What are check-in and check-out times?',
        a: 'Check-in is at 4:00 PM and check-out is at 11:00 AM. Early check-in and late check-out are available for $30 each, subject to availability — just ask.',
      },
      {
        q: 'How does check-in work?',
        a: "After booking you'll receive access to our digital guest app, where you'll submit your ID for verification. Your unique door code is sent 2 days before check-in. No front desk, no waiting, no keys to lose.",
      },
      {
        q: 'Do I need to pick up a key?',
        a: 'No. Every property uses a smart lock with a digital keypad. Your personal door code is delivered to your phone before arrival.',
      },
    ],
  },
  {
    category: 'At the Property',
    icon: '🏡',
    questions: [
      {
        q: "What's included at the property?",
        a: 'All properties are stocked with fresh linens and towels, a coffee maker with coffee to get you started, paper goods, and cleaning supplies. Everything you need to feel at home from the moment you arrive.',
      },
      {
        q: 'Is Wi-Fi included?',
        a: 'Yes — all properties include complimentary high-speed wireless internet.',
      },
      {
        q: 'Is there in-unit laundry?',
        a: 'Yes. Every property has its own washer and dryer — no shared laundry rooms or laundromat runs.',
      },
      {
        q: 'What about parking?',
        a: 'Parking availability varies by property. Message us with your reservation details and we\'ll walk you through exactly what\'s available for your unit.',
      },
      {
        q: 'What if something is broken or missing when I arrive?',
        a: "Just send us a text right away and we'll get it sorted. We respond quickly and will make sure your stay isn't disrupted.",
      },
      {
        q: 'Can I have mail or packages delivered to the property?',
        a: 'No — deliveries to our properties are not permitted. For mail, use General Delivery at the nearest post office or a P.O. Box. For packages, ship to an Amazon Locker, UPS Store, or FedEx location for pickup. We are not responsible for lost, misdelivered, or stolen mail or packages, and our team is unable to assist with tracking or recovery.',
      },
    ],
  },
  {
    category: 'Pets',
    icon: '🐾',
    questions: [
      {
        q: 'Are pets allowed?',
        a: 'Yes, at pet-friendly properties with prior written approval. A non-refundable pet fee applies per stay — fees vary by property and start at $79. Pets must be added to your reservation before check-in. All pets must be house-trained, attended when not crated, and non-aggressive.',
      },
      {
        q: 'Are service animals allowed?',
        a: 'Absolutely. ADA-defined service animals are always welcome at no additional charge.',
      },
    ],
  },
  {
    category: 'Policies',
    icon: '📋',
    questions: [
      {
        q: 'Are parties or events allowed?',
        a: "No parties or events without prior written permission from Stay Roanoke. This includes bachelor and bachelorette gatherings, weddings, receptions, and any group exceeding the reservation's maximum occupancy. Violations result in a $1,000 fee and immediate termination of the stay.",
      },
      {
        q: 'Is smoking allowed?',
        a: 'No. All properties are strictly non-smoking — including vaping and cannabis. A $500 fee applies for any violation, plus the cost of any remediation.',
      },
      {
        q: 'What are quiet hours?',
        a: 'Quiet hours are 10:00 PM to 7:00 AM. Noise must remain at normal conversational levels throughout the day. Outdoor music is not permitted after 10:00 PM.',
      },
      {
        q: 'Are there security cameras?',
        a: 'Exterior cameras only — at entrances, parking areas, and outdoor common spaces. There are no cameras or audio recording devices inside any property. A decibel-only noise monitor (no audio recording) may be present outside the unit.',
      },
    ],
  },
  {
    category: 'Long Stays',
    icon: '🗓️',
    questions: [
      {
        q: 'Do you offer monthly or extended-stay rates?',
        a: "Yes. Stays of 30 nights or more qualify for discounted rates. We're a great fit for remote workers, traveling professionals, and anyone who needs a furnished home base in Roanoke. Contact us directly for pricing.",
      },
      {
        q: 'What is the maximum stay?',
        a: 'Stays up to 89 consecutive nights are available. Get in touch for anything beyond that.',
      },
    ],
  },
]

let accordionCounter = 0
function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  const id = useRef(`faq-${++accordionCounter}`)
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
      <button
        className={styles.question}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id.current}
      >
        <span>{question}</span>
        <span className={styles.chevron} aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <p id={id.current} className={styles.answer} hidden={!open}>{answer}</p>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Stay Roanoke</p>
          <h1>Frequently Asked Questions</h1>
          <p className={styles.heroSub}>Everything you need to know before, during, and after your stay.</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.faqList}>
          {FAQS.map(section => (
            <div key={section.category} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.category}
              </h2>
              <div className={styles.accordion}>
                {section.questions.map(({ q, a }) => (
                  <AccordionItem key={q} question={q} answer={a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>Still have questions?</p>
            <p className={styles.sidebarBody}>Text or email us — we respond fast.</p>
            <a href="sms:+15407327151" className={styles.sidebarBtn}>Text (540) 732-7151</a>
            <a href="mailto:info@stayroanoke.com" className={styles.sidebarLink}>info@stayroanoke.com</a>
          </div>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>Ready to book?</p>
            <p className={styles.sidebarBody}>Browse all available properties in Roanoke & Salem.</p>
            <Link to="/search" className={styles.sidebarBtn}>Search Properties</Link>
          </div>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>Full policies</p>
            <p className={styles.sidebarBody}>Read our complete Terms & Conditions for all the details.</p>
            <Link to="/terms" className={styles.sidebarLink}>Terms & Conditions →</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
