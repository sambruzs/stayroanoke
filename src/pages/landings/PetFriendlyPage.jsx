import React from 'react'
import LandingPage from '../LandingPage'

export default function PetFriendlyPage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'Roanoke & Salem, Virginia',
        heading: 'Pet-Friendly Rentals in Roanoke, VA',
        sub: 'Bring your dog along. Stay Roanoke has pet-welcoming homes with fenced yards, trail access, and all the comforts of home — for you and your furry travel companion.',
      }}
      sections={[
        {
          heading: 'Dogs Welcome Here',
          body: 'Our pet-friendly properties are set up for dogs from day one — fenced yards, easy-clean floors, and proximity to Roanoke\'s best dog-friendly trails and parks. No sneaking pets in; just let us know when you book.',
        },
        {
          heading: 'Blue Ridge Trails at Your Doorstep',
          body: 'Roanoke is one of the best cities in Virginia for hiking with dogs. Stay close to Carvins Cove, the Roanoke River Greenway, Mill Mountain Trail, and the Appalachian Trail — all dog-friendly and just minutes from our properties.',
        },
        {
          heading: 'Transparent Pet Fees',
          body: 'Pet fees start at $79 per stay and vary by property. There are no hidden charges — the fee is shown clearly at checkout. We keep it simple so you can plan your trip without surprises.',
        },
        {
          heading: 'Book Direct for Best Rate',
          body: 'Skip Airbnb and VRBO. When you book direct at stayroanoke.com you get our lowest rate, guaranteed — with no platform markups. Contact us directly if you have questions about a specific property\'s pet policy.',
        },
      ]}
      faqs={[
        {
          q: 'Which Stay Roanoke properties allow pets?',
          a: 'Several of our properties welcome pets. Use the pet-friendly filter on our search page to see available options, or contact us at (540) 732-7151 and we\'ll match you with the right home.',
        },
        {
          q: 'What is the pet fee?',
          a: 'Pet fees start at $79 per stay and vary by property. The fee will be shown clearly before you complete your booking — no surprises at checkout.',
        },
        {
          q: 'How many pets can I bring?',
          a: 'Most properties allow 1–2 dogs. Please let us know the number and size of your pets when booking so we can confirm the right property for your group.',
        },
        {
          q: 'Are there dog-friendly activities near Stay Roanoke properties?',
          a: 'Yes — Roanoke is outstanding for dog owners. Carvins Cove Natural Reserve, the Roanoke River Greenway (20+ paved miles), Mill Mountain Park, and sections of the Appalachian Trail are all dog-friendly and within easy reach of our properties.',
        },
      ]}
      filterFn={(l) => {
        const tags = l.tags || l.amenities || []
        const combined = JSON.stringify(tags).toLowerCase()
        return combined.includes('pet') || combined.includes('dog')
      }}
      searchUrl="/search?pets=1"
      searchLabel="See Pet-Friendly Properties →"
    />
  )
}
