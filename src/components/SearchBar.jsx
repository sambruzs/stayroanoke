import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, parseISO } from 'date-fns'
import styles from './SearchBar.module.css'

export default function SearchBar({ initialValues = {}, compact = false }) {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ? parseISO(initialValues.checkIn) : null)
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ? parseISO(initialValues.checkOut) : null)
  const [guests, setGuests] = useState(initialValues.guests || 2)
  const [pets, setPets] = useState(initialValues.pets || 0)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    params.set('guests', guests)
    if (pets > 0) params.set('pets', pets)
    setSheetOpen(false)
    navigate(`/search?${params.toString()}`)
  }

  function pillLabel() {
    const dateStr = checkIn && checkOut
      ? `${format(checkIn, 'MMM d')} – ${format(checkOut, 'MMM d')}`
      : 'Any dates'
    const guestStr = `${guests} guest${guests !== 1 ? 's' : ''}${pets > 0 ? ` · ${pets} pet${pets !== 1 ? 's' : ''}` : ''}`
    return `${dateStr} · ${guestStr}`
  }

  const fields = (
    <>
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
      <div className={styles.divider} />
      <div className={styles.field}>
        <label>Pets 🐾</label>
        <div className={styles.guestControl}>
          <button type="button" onClick={() => setPets(p => Math.max(0, p - 1))}>−</button>
          <span>{pets} {pets === 1 ? 'Pet' : 'Pets'}</span>
          <button type="button" onClick={() => setPets(p => Math.min(2, p + 1))}>+</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop bar */}
      <form onSubmit={handleSearch} className={`${styles.bar} ${compact ? styles.compact : ''}`}>
        {fields}
        {compact ? (
          <button type="submit" className={styles.searchBtn}>Search</button>
        ) : (
          <div className={styles.btnRow}>
            <button type="submit" className={styles.searchBtn}>Find Your Stay</button>
          </div>
        )}
      </form>

      {/* Mobile pill */}
      <button type="button" className={styles.pill} onClick={() => setSheetOpen(true)}>
        <span className={styles.pillIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span className={styles.pillLabel}>{pillLabel()}</span>
        <span className={styles.pillChevron}>▾</span>
      </button>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setSheetOpen(false)}>
          <form
            onSubmit={handleSearch}
            className={styles.sheet}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Find Your Stay</span>
              <button type="button" className={styles.sheetClose} onClick={() => setSheetOpen(false)}>×</button>
            </div>
            <div className={styles.sheetFields}>
              {fields}
            </div>
            <div className={styles.sheetFooter}>
              <button type="submit" className={styles.searchBtn}>Search</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
