import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { getListings } from '../utils/guestyApi'
import { mockListings } from '../data/mockListings'
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
        const data = await getListings({ checkIn, checkOut, guests })
        if (data?.results?.length) {
          setListings(data.results)
        } else {
          setListings(mockListings)
        }
      } catch {
        setListings(mockListings)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [checkIn, checkOut, guests])

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
              {loading ? 'Searching...' : `${filtered.length} properties in Roanoke & Salem`}
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
