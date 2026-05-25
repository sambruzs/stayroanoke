import React from 'react'
import LandingPage from '../LandingPage'

export default function FurnishedRentalsPage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'Roanoke & Salem, Virginia',
        heading: 'Furnished Rentals in Roanoke, VA',
        sub: 'Fully furnished, move-in ready homes available for short stays, extended visits, and monthly stays. Book direct for the best rate.',
      }}
      sections={[
        {
          heading: 'Everything Included',
          body: 'Every Stay Roanoke property comes fully furnished with high-speed WiFi, in-unit washer/dryer, a fully stocked kitchen, and fresh linens — ready from the moment you arrive. No furniture hunting, no utility setup.',
        },
        {
          heading: 'Short Stay or Long Stay',
          body: 'Whether you need a place for a long weekend or a 60-day work assignment, we have you covered. Stays from 2 nights up to 89 days are available, with discounted monthly rates for stays of 30 nights or more.',
        },
        {
          heading: 'Book Direct, Save More',
          body: 'Skip the Airbnb and VRBO fees. When you book direct at stayroanoke.com you get our lowest rate — guaranteed. No hidden platform markups, just straightforward pricing.',
        },
        {
          heading: 'Local Team, Real Support',
          body: 'We\'re a Roanoke-based team. If something comes up during your stay, you reach a real local person — not a call center. Text us at (540) 732-7151.',
        },
      ]}
      faqs={[
        {
          q: 'What does "fully furnished" mean?',
          a: 'All furniture, linens, towels, kitchenware, and appliances are included. You bring your suitcase — everything else is ready.',
        },
        {
          q: 'Are furnished rentals available month-to-month in Roanoke?',
          a: 'Yes. Stays of 30 nights or more qualify for discounted monthly rates. Contact us directly for pricing on extended stays.',
        },
        {
          q: 'Do furnished rentals in Roanoke include utilities?',
          a: 'Yes — WiFi, electricity, water, and all utilities are included in your nightly or monthly rate. No separate bills.',
        },
        {
          q: 'Can I book a furnished rental for a work assignment or relocation?',
          a: 'Absolutely. We regularly host traveling professionals, contract workers, and people in the middle of a relocation. We can accommodate stays up to 89 consecutive nights.',
        },
      ]}
      filterFn={null}
      searchUrl="/search"
      searchLabel="Browse Furnished Rentals →"
    />
  )
}
