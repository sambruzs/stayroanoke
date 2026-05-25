import React from 'react'
import LandingPage from '../LandingPage'

export default function MonthlyRentalsPage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'Roanoke & Salem, Virginia',
        heading: 'Monthly & Extended Stay Rentals in Roanoke, VA',
        sub: 'Need a place for 30, 60, or 90 days? Stay Roanoke offers furnished monthly rentals with discounted rates, all utilities included, and no lease required.',
      }}
      sections={[
        {
          heading: 'Discounted Monthly Rates',
          body: 'Stays of 30 nights or more automatically qualify for our lowest rates. No negotiating, no separate contracts — the discount is built in. Contact us directly for a custom quote on stays of 60 days or longer.',
        },
        {
          heading: 'Everything Included — One Rate',
          body: 'All utilities are included: high-speed WiFi, electricity, water, and in-unit washer/dryer. Linens, towels, and a fully stocked kitchen are ready on arrival. You pay one rate — no juggling utility bills.',
        },
        {
          heading: 'Flexible, No Long-Term Lease',
          body: 'Stays are available up to 89 consecutive nights — no 12-month lease, no credit check, no moving truck. Ideal for work assignments, relocations, traveling nurses, and anyone who needs a real home between housing transitions.',
        },
        {
          heading: 'Local Support Throughout Your Stay',
          body: 'We\'re a Roanoke-based team, not a remote call center. If something needs attention during a long stay, reach us by text at (540) 732-7151 and get a response from someone who actually knows the property.',
        },
      ]}
      faqs={[
        {
          q: 'What is the minimum stay for a monthly rate?',
          a: '30 nights. Stays of 30 nights or more qualify for our discounted monthly rates automatically. Our maximum stay is 89 consecutive nights.',
        },
        {
          q: 'Are utilities included in the monthly rate?',
          a: 'Yes — WiFi, electricity, water, and all utilities are included in your rate. You will not receive separate utility bills during your stay.',
        },
        {
          q: 'Can I extend my stay once I\'m already there?',
          a: 'In most cases, yes — subject to availability. Contact us as early as possible if you\'d like to extend and we\'ll do our best to accommodate you in the same property.',
        },
        {
          q: 'Who typically books extended stays with Stay Roanoke?',
          a: 'Traveling nurses and healthcare workers, corporate contractors, people relocating to Roanoke who need a furnished place while house-hunting, and remote workers who want a change of scenery for a month or two.',
        },
        {
          q: 'Do you offer corporate housing accounts?',
          a: 'Yes — we work with local employers, staffing agencies, and HR teams to arrange extended stays for employees. Contact us at info@stayroanoke.com for corporate rates and invoicing options.',
        },
      ]}
      filterFn={null}
      searchUrl="/search"
      searchLabel="Browse Extended Stay Properties →"
    />
  )
}
