export const mockListings = [
  {
    id: 'mock-001',
    title: 'Creekside Cabin on Mill Mountain',
    nickname: 'Mill Mountain Retreat',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 3,
    bathrooms: 2,
    accommodates: 6,
    price: { basePrice: 189 },
    amenities: ['Hot Tub', 'Fireplace', 'WiFi', 'Washer/Dryer', 'Kitchen', 'Parking', 'Pet Friendly'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'A cozy creekside escape nestled in the trees of Mill Mountain. Wake up to the sound of the water and hike to the Roanoke Star before breakfast.'
    },
    reviewsStats: { avgRating: 4.9, numberOfReviews: 47 },
    tags: ['Hot Tub', 'Pet Friendly']
  },
  {
    id: 'mock-002',
    title: 'Modern Farmhouse Near Carvins Cove',
    nickname: 'Carvins Cove Farmhouse',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 4,
    bathrooms: 3,
    accommodates: 8,
    price: { basePrice: 249 },
    amenities: ['Pool', 'Fire Pit', 'WiFi', 'Game Room', 'Kitchen', 'Parking', 'EV Charger'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Sprawling modern farmhouse with mountain views, a pool, and direct trail access to Carvins Cove reservoir. Perfect for larger groups and outdoor enthusiasts.'
    },
    reviewsStats: { avgRating: 4.8, numberOfReviews: 31 },
    tags: ['Pool', 'Large Group']
  },
  {
    id: 'mock-003',
    title: 'Cozy Loft in Historic Downtown Roanoke',
    nickname: 'Downtown Loft',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 1,
    bathrooms: 1,
    accommodates: 2,
    price: { basePrice: 115 },
    amenities: ['WiFi', 'Kitchen', 'Washer/Dryer', 'Smart TV', 'Parking'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Stylish industrial loft steps from the Roanoke City Market, craft breweries, and the Taubman Museum. Perfect for couples exploring the city.'
    },
    reviewsStats: { avgRating: 4.7, numberOfReviews: 88 },
    tags: ['City Center', 'Couples']
  },
  {
    id: 'mock-004',
    title: 'Secluded Ridge Cabin with Panoramic Views',
    nickname: 'Blue Ridge Overlook',
    address: { city: 'Salem', state: 'VA', full: 'Salem, VA' },
    bedrooms: 2,
    bathrooms: 1,
    accommodates: 4,
    price: { basePrice: 159 },
    amenities: ['Hot Tub', 'Fire Pit', 'WiFi', 'Deck', 'Kitchen', 'Parking'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Perched on a private ridge with sweeping Blue Ridge views from every window. A true off-grid feeling with all the modern comforts.'
    },
    reviewsStats: { avgRating: 5.0, numberOfReviews: 22 },
    tags: ['Hot Tub', 'Best Views']
  },
  {
    id: 'mock-005',
    title: 'Craftsman Bungalow Near McAfee Knob',
    nickname: 'Knob Bungalow',
    address: { city: 'Salem', state: 'VA', full: 'Salem, VA' },
    bedrooms: 3,
    bathrooms: 2,
    accommodates: 6,
    price: { basePrice: 175 },
    amenities: ['Fire Pit', 'WiFi', 'Washer/Dryer', 'Kitchen', 'Parking', 'Pet Friendly'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Charming craftsman bungalow just minutes from the McAfee Knob trailhead, one of the most photographed spots on the Appalachian Trail.'
    },
    reviewsStats: { avgRating: 4.8, numberOfReviews: 56 },
    tags: ['Pet Friendly', 'Hiker Favorite']
  },
  {
    id: 'mock-006',
    title: 'Lakeside Cottage at Claytor Lake',
    nickname: 'Claytor Lake Cottage',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 2,
    bathrooms: 2,
    accommodates: 5,
    price: { basePrice: 195 },
    amenities: ['Kayaks', 'Fire Pit', 'WiFi', 'Deck', 'Kitchen', 'Parking'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Sweet waterfront cottage with a private dock, kayaks, and a screened porch perfect for evening sunsets over the lake.'
    },
    reviewsStats: { avgRating: 4.9, numberOfReviews: 39 },
    tags: ['Waterfront', 'Kayaks']
  },
  {
    id: 'mock-007',
    title: 'Rustic A-Frame in the Appalachian Foothills',
    nickname: 'Foothills A-Frame',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 2,
    bathrooms: 1,
    accommodates: 4,
    price: { basePrice: 145 },
    amenities: ['Hot Tub', 'Fire Pit', 'WiFi', 'Fireplace', 'Kitchen', 'Parking'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Classic A-frame cabin with soaring ceilings, a wood-burning fireplace, and a hot tub under the stars. A romantic retreat for all seasons.'
    },
    reviewsStats: { avgRating: 4.9, numberOfReviews: 61 },
    tags: ['Hot Tub', 'Romantic']
  },
  {
    id: 'mock-008',
    title: 'Wine Country Retreat Near Beliveau Farm',
    nickname: 'Vineyard View Cottage',
    address: { city: 'Salem', state: 'VA', full: 'Salem, VA' },
    bedrooms: 3,
    bathrooms: 2,
    accommodates: 6,
    price: { basePrice: 215 },
    amenities: ['Fire Pit', 'WiFi', 'Deck', 'Kitchen', 'Parking', 'Pet Friendly'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Surrounded by rolling farmland and close to Beliveau Farm Winery, this charming cottage is perfect for wine lovers and nature seekers alike.'
    },
    reviewsStats: { avgRating: 4.7, numberOfReviews: 29 },
    tags: ['Wine Country', 'Pet Friendly']
  },
  {
    id: 'mock-009',
    title: 'Treehouse Suite in the Blue Ridge',
    nickname: 'Blue Ridge Treehouse',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 1,
    bathrooms: 1,
    accommodates: 2,
    price: { basePrice: 225 },
    amenities: ['Hot Tub', 'WiFi', 'Deck', 'Mini Kitchen', 'Unique Stay'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'Sleep among the treetops in this elevated treehouse suite with a private hot tub and forest views in every direction. Truly unforgettable.'
    },
    reviewsStats: { avgRating: 5.0, numberOfReviews: 18 },
    tags: ['Unique Stay', 'Romantic']
  },
  {
    id: 'mock-010',
    title: 'Family Farmstead with Barn & Acreage',
    nickname: 'Bradshaw Farmstead',
    address: { city: 'Salem', state: 'VA', full: 'Salem, VA' },
    bedrooms: 5,
    bathrooms: 3,
    accommodates: 12,
    price: { basePrice: 375 },
    amenities: ['Fire Pit', 'WiFi', 'Washer/Dryer', 'Kitchen', 'Parking', 'Pet Friendly', 'Game Room'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'A working farmstead with a historic barn, five acres, and room for the whole family or a group retreat. Bring the kids, dogs, and your sense of adventure.'
    },
    reviewsStats: { avgRating: 4.8, numberOfReviews: 14 },
    tags: ['Large Group', 'Pet Friendly']
  },
  {
    id: 'mock-011',
    title: 'Studio Cabin near Explore Park',
    nickname: 'Explore Park Studio',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 1,
    bathrooms: 1,
    accommodates: 2,
    price: { basePrice: 99 },
    amenities: ['WiFi', 'Kitchen', 'Fire Pit', 'Parking'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'An affordable, charming studio cabin minutes from Explore Park and the Blue Ridge Parkway. Great for solo travelers and weekend warriors.'
    },
    reviewsStats: { avgRating: 4.6, numberOfReviews: 73 },
    tags: ['Budget Friendly', 'Solo Traveler']
  },
  {
    id: 'mock-012',
    title: 'Restored Victorian in South Roanoke',
    nickname: 'South Roanoke Victorian',
    address: { city: 'Roanoke', state: 'VA', full: 'Roanoke, VA' },
    bedrooms: 4,
    bathrooms: 3,
    accommodates: 8,
    price: { basePrice: 285 },
    amenities: ['WiFi', 'Washer/Dryer', 'Kitchen', 'Parking', 'Smart TV', 'Fireplace'],
    pictures: [
      { thumbnail: 'https://images.unsplash.com/photo-1533779283741-8f6a0f0ec2d0?w=800&q=80' }
    ],
    publicDescription: {
      summary: 'A beautifully restored 1890s Victorian in the heart of South Roanoke, within walking distance of boutique shops, restaurants, and the greenway.'
    },
    reviewsStats: { avgRating: 4.9, numberOfReviews: 42 },
    tags: ['Historic', 'Walkable']
  }
]
