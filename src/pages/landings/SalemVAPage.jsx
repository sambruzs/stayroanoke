import React from 'react'
import LandingPage from '../LandingPage'

export default function SalemVAPage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'Salem, Virginia',
        heading: 'Vacation Rentals in Salem, VA',
        sub: 'Furnished homes in Salem, VA — minutes from Roanoke, the Blue Ridge Parkway, and some of Virginia\'s best hiking, dining, and live events.',
      }}
      sections={[
        {
          heading: 'Salem\'s Best Neighborhoods',
          body: 'Salem sits just west of Roanoke with its own distinct character — quieter streets, smaller-town feel, and easy access to everything the greater Roanoke Valley has to offer. Our Salem properties put you close to downtown Salem dining, Roanoke College, and the Salem Civic Center.',
        },
        {
          heading: 'Close to Everything',
          body: 'Salem is minutes from the Blue Ridge Parkway, Dixie Caverns, and the Appalachian Trail. You\'re also a short drive from downtown Roanoke\'s restaurants, breweries, and the Taubman Museum of Art. The best of both worlds.',
        },
        {
          heading: 'Fully Furnished, Move-In Ready',
          body: 'Every Stay Roanoke property in Salem comes fully furnished with high-speed WiFi, in-unit washer/dryer, a stocked kitchen, and fresh linens. Short stays, weekend getaways, and extended monthly stays all available.',
        },
        {
          heading: 'Book Direct, Save More',
          body: 'Skip Airbnb and VRBO fees. Booking direct at stayroanoke.com guarantees you our lowest rate — no platform markup, no hidden charges. Text us at (540) 732-7151 for help finding the right property.',
        },
      ]}
      faqs={[
        {
          q: 'Where are Stay Roanoke\'s Salem properties located?',
          a: 'Our Salem properties are spread across residential neighborhoods in Salem, VA — all within easy driving distance of downtown Salem, Roanoke, and the Blue Ridge Mountains.',
        },
        {
          q: 'What is there to do near Salem, VA vacation rentals?',
          a: 'Salem offers easy access to hiking at Hanging Rock (Roanoke), the Salem Red Sox stadium, Roanoke College events, Dixie Caverns, and the full range of Roanoke Valley activities — breweries, restaurants, trails, and more.',
        },
        {
          q: 'Are Salem rentals available for monthly stays?',
          a: 'Yes — stays of 30 nights or more qualify for discounted monthly rates at eligible Salem properties. Contact us for current availability and extended-stay pricing.',
        },
        {
          q: 'Is Salem, VA close to Roanoke?',
          a: 'Yes — Salem and Roanoke are adjacent cities. Most Salem properties are a 10–15 minute drive from downtown Roanoke, the Roanoke-Blacksburg Regional Airport, and major medical centers.',
        },
      ]}
      filterFn={(l) => {
        const location = (l.address?.city || l.city || l.location || '').toLowerCase()
        return location.includes('salem')
      }}
      searchUrl="/search"
      searchLabel="Browse Salem Properties →"
    />
  )
}
