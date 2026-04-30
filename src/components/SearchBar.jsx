import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import styles from './SearchBar.module.css'

export default function SearchBar({ initialValues = {}, compact = false }) {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ? new Date(initialValues.checkIn) : null)
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ? new Date(initialValues.checkOut) : null)
  const [guests, setGuests] = useState(initialValues.guests || 2)

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    params.set('guests', guests)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className={`${styles.bar} ${compact ? styles.compact : ''}`}>
      <div className={styles.field}>
        <label>Check In</label>
        <DatePicker
          selected={checkIn}
          onChange={date => { setCheckIn(date); if (checkOut && date >= checkOut) setCheckOut(null) }}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={new Date()}
          placeholderText="Select date"
          dateFormat="MMM d, yyyy"
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.field}>
        <label>Check Out</label>
        <DatePicker
          selected={checkOut}
          onChange={date => setCheckOut(date)}
          selectsEnd
          startDate={checkIn}
          endDate={checkOut}
          minDate={checkIn || new Date()}
          placeholderText="Select date"
          dateFormat="MMM d, yyyy"
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.field}>
        <label>Guests</label>
        <div className={styles.guestControl}>
          <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
          <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          <button type="button" onClick={() => setGuests(g => Math.min(16, g + 1))}>+</button>
        </div>
      </div>
      <button type="submit" className={styles.searchBtn}>
        {compact ? 'Search' : 'Find Your Stay'}
      </button>
    </form>
  )
}
