import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import MapView from '../components/MapView'
import { getListings, checkListingsAvailability } from '../utils/guestyApi'
import styles from './SearchPage.module.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bedroomFilter, setBedroomFilter] = useState('any')
  const [sortBy, setSortBy] = useState('default')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests') || 1
  const pets = parseInt(searchParams.get('pets') || '0')
  const tag = searchParams.get('tag') || ''

  // Map category chips to Guesty amenity strings for reliable matching
  const TAG_AMENITY = {
    'Hot Tubs': 'hot tub',
    'Pet Friendly': 'pets allowed',
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getListings({ guests })
        const results = data?.results || data?.data || (Array.isArray(data) ? data : [])
        if (!results.length) { setListings([]); return }

        const petFriendly = pets > 0
          ? results.filter(l => l.amenities?.some(a => a.toLowerCase() === 'pets allowed'))
          : results

        if (checkIn && checkOut) {
          const listingIds = petFriendly.map(l => l._id || l.id).filter(Boolean)
          const { availableIds } = await checkListingsAvailability({ listingIds, checkIn, checkOut, guests })
          const availableSet = new Set(availableIds)
          setListings(petFriendly.filter(l => availableSet.has(l._id || l.id)))
        } else {
          setListings(petFriendly)
        }
      } catch {
        setListings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [guests, checkIn, checkOut, pets])

  // Client-side filters
  let filtered = [...listings]
  if (tag) {
    const amenity = TAG_AMENITY[tag]
    if (amenity) {
      filtered = filtered.filter(l => l.amenities?.some(a => a.toLowerCase().includes(amenity)))
    } else {
      const kw = tag.toLowerCase()
      filtered = filtered.filter(l =>
        l.title?.toLowerCase().includes(kw) ||
        l.nickname?.toLowerCase().includes(kw) ||
        l.tags?.some(t => t.toLowerCase().includes(kw))
      )
    }
  }
  if (bedroomFilter !== 'any') {
    const n = parseInt(bedroomFilter)
    filtered = filtered.filter(l => bedroomFilter === '4+' ? l.bedrooms >= 4 : l.bedrooms === n)
  }
  if (minPrice !== '') filtered = filtered.filter(l => (l.prices?.basePrice || l.price?.basePrice || 0) >= parseInt(minPrice))
  if (maxPrice !== '') filtered = filtered.filter(l => (l.prices?.basePrice || l.price?.basePrice || 0) <= parseInt(maxPrice))
  if (sortBy === 'price-asc') filtered.sort((a, b) => (a.prices?.basePrice || a.price?.basePrice || 0) - (b.prices?.basePrice || b.price?.basePrice || 0))
  if (sortBy === 'price-desc') filtered.sort((a, b) => (b.prices?.basePrice || b.price?.basePrice || 0) - (a.prices?.basePrice || a.price?.basePrice || 0))
  if (sortBy === 'rating') filtered.sort((a, b) => (b.reviewsStats?.avgRating || 0) - (a.reviewsStats?.avgRating || 0))

  return (
    <div className={styles.page}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBarWrap}>
          <SearchBar
            compact
            initialValues={{ checkIn, checkOut, guests: parseInt(guests), pets }}
          />
        </div>
      </div>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Bedrooms</h3>
            {['any', '1', '2', '3', '4+'].map(opt => (
              <label key={opt} className={styles.filterOption}>
                <input
                  type="radio"
                  name="bedrooms"
                  value={opt}
                  checked={bedroomFilter === opt}
                  onChange={() => setBedroomFilter(opt)}
                />
                {opt === 'any' ? 'Any' : opt === '4+' ? '4+ Bedrooms' : `${opt} Bedroom${opt !== '1' ? 's' : ''}`}
              </label>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <h3>Price / Night</h3>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min $"
                min="0"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
              <span className={styles.priceSep}>–</span>
              <input
                type="number"
                placeholder="Max $"
                min="0"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </div>
            {(minPrice || maxPrice) && (
              <button className={styles.clearFilter} onClick={() => { setMinPrice(''); setMaxPrice('') }}>
                Clear price
              </button>
            )}
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {loading
                ? (checkIn && checkOut ? 'Checking availability...' : 'Searching...')
                : `${filtered.length} ${checkIn && checkOut ? 'available' : ''} ${tag ? tag + ' ' : ''}properties in Roanoke & Salem`}
              {checkIn && checkOut && !loading && (
                <span className={styles.dateRange}> · {checkIn} – {checkOut}</span>
              )}
            </h2>
            <div className={styles.headerControls}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >⊞ List</button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'map' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('map')}
                  aria-label="Map view"
                >⊙ Map</button>
              </div>
              <select
                className={styles.sort}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Finding your perfect stay...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No properties found. Try adjusting your filters or browse all properties.</p>
            </div>
          ) : viewMode === 'map' ? (
            <MapView listings={filtered} searchParams={searchParams.toString()} />
          ) : (
            <div className={styles.grid}>
              {filtered.map(listing => (
                <ListingCard
                  key={listing._id || listing.id}
                  listing={listing}
                  searchParams={searchParams.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
