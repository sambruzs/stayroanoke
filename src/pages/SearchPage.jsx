import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { getListings, checkListingsAvailability } from '../utils/guestyApi'
import styles from './SearchPage.module.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bedroomFilter, setBedroomFilter] = useState('any')
  const [sortBy, setSortBy] = useState('default')

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests') || 1

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getListings({ guests })
        const results = data?.results || data?.data || (Array.isArray(data) ? data : [])
        if (!results.length) { setListings([]); return }

        if (checkIn && checkOut) {
          const listingIds = results.map(l => l._id || l.id).filter(Boolean)
          const { availableIds } = await checkListingsAvailability({ listingIds, checkIn, checkOut })
          const availableSet = new Set(availableIds)
          setListings(results.filter(l => availableSet.has(l._id || l.id)))
        } else {
          setListings(results)
        }
      } catch {
        setListings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [guests, checkIn, checkOut])

  // Client-side filters
  let filtered = [...listings]
  if (bedroomFilter !== 'any') {
    const n = parseInt(bedroomFilter)
    filtered = filtered.filter(l => bedroomFilter === '4+' ? l.bedrooms >= 4 : l.bedrooms === n)
  }
  if (sortBy === 'price-asc') filtered.sort((a, b) => (a.prices?.basePrice || a.price?.basePrice || 0) - (b.prices?.basePrice || b.price?.basePrice || 0))
  if (sortBy === 'price-desc') filtered.sort((a, b) => (b.prices?.basePrice || b.price?.basePrice || 0) - (a.prices?.basePrice || a.price?.basePrice || 0))
  if (sortBy === 'rating') filtered.sort((a, b) => (b.reviewsStats?.avgRating || 0) - (a.reviewsStats?.avgRating || 0))

  return (
    <div className={styles.page}>
      <div className={styles.searchHeader}>
        <div className={styles.searchBarWrap}>
          <SearchBar
            compact
            initialValues={{ checkIn, checkOut, guests: parseInt(guests) }}
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
        </aside>

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {loading
                ? (checkIn && checkOut ? 'Checking availability...' : 'Searching...')
                : `${filtered.length} ${checkIn && checkOut ? 'available' : ''} properties in Roanoke & Salem`}
              {checkIn && checkOut && !loading && (
                <span className={styles.dateRange}> · {checkIn} – {checkOut}</span>
              )}
            </h2>
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

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Finding your perfect stay...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No properties found. Try adjusting your guest count or browse all properties.</p>
            </div>
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
