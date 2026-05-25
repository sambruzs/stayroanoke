import React, { useState, useRef, useEffect } from 'react'
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
  const sheetRef = useRef(null)
  const pillRef = useRef(null)

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

  // Focus trap + Escape for mobile sheet
  useEffect(() => {
    if (!sheetOpen) return
    const el = sheetRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function handleKey(e) {
      if (e.key === 'Escape') { setSheetOpen(false); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      pillRef.current?.focus()
    }
  }, [sheetOpen])

  const fields = (prefix) => (
    <>
      <div className={styles.field}>
        <label htmlFor={`${prefix}check-in`}>Check In</label>
        <DatePicker
          id={`${prefix}check-in`}
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
        <label htmlFor={`${prefix}check-out`}>Check Out</label>
        <DatePicker
          id={`${prefix}check-out`}
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
        <span id={`${prefix}guests-label`} className={styles.fieldLabel}>Guests</span>
        <div className={styles.guestControl} role="group" aria-labelledby={`${prefix}guests-label`}>
          <button type="button" aria-label="Decrease guests" onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
          <span aria-live="polite" aria-atomic="true">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          <button type="button" aria-label="Increase guests" onClick={() => setGuests(g => Math.min(16, g + 1))}>+</button>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.field}>
        <span id={`${prefix}pets-label`} className={styles.fieldLabel}>Pets <span aria-hidden="true">🐾</span></span>
        <div className={styles.guestControl} role="group" aria-labelledby={`${prefix}pets-label`}>
          <button type="button" aria-label="Decrease pets" onClick={() => setPets(p => Math.max(0, p - 1))}>−</button>
          <span aria-live="polite" aria-atomic="true">{pets} {pets === 1 ? 'Pet' : 'Pets'}</span>
          <button type="button" aria-label="Increase pets" onClick={() => setPets(p => Math.min(2, p + 1))}>+</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop bar */}
      <form onSubmit={handleSearch} className={`${styles.bar} ${compact ? styles.compact : ''}`}>
        {fields('desk-')}
        {compact ? (
          <button type="submit" className={styles.searchBtn}>Search</button>
        ) : (
          <div className={styles.btnRow}>
            <button type="submit" className={styles.searchBtn}>Find Your Stay</button>
          </div>
        )}
      </form>

      {/* Mobile pill */}
      <button
        ref={pillRef}
        type="button"
        className={styles.pill}
        aria-label={`Search: ${pillLabel()}`}
        aria-expanded={sheetOpen}
        aria-haspopup="dialog"
        onClick={() => setSheetOpen(true)}
      >
        <span className={styles.pillIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span className={styles.pillLabel}>{pillLabel()}</span>
        <span className={styles.pillChevron} aria-hidden="true">▾</span>
      </button>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setSheetOpen(false)}>
          <form
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Find Your Stay"
            onSubmit={handleSearch}
            className={styles.sheet}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Find Your Stay</span>
              <button type="button" className={styles.sheetClose} aria-label="Close search" onClick={() => setSheetOpen(false)}>×</button>
            </div>
            <div className={styles.sheetFields}>
              {fields('mob-')}
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
