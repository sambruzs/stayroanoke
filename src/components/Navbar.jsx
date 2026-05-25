import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import { StayRoanokeLogo } from './Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const menuRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Focus trap + Escape for mobile menu
  useEffect(() => {
    if (!menuOpen) return
    const el = menuRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function handleKey(e) {
      if (e.key === 'Escape') { setMenuOpen(false); return }
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
      hamburgerRef.current?.focus()
    }
  }, [menuOpen])

  const transparent = isHome && !scrolled
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav aria-label="Main navigation" className={`${styles.nav} ${transparent ? styles.transparent : styles.solid}`}>
      <Link to="/" className={styles.logo} aria-label="Stay Roanoke — home" onClick={closeMenu}>
        <StayRoanokeLogo markSize={38} />
      </Link>
      <div className={styles.links}>
        <Link to="/search" className={styles.link}>Properties</Link>
        <Link to="/partners" className={styles.link}>Partner Listings</Link>
        <Link to="/blog" className={styles.link}>Guide</Link>
        <Link to="/faq" className={styles.link}>FAQ</Link>
        <a href="mailto:info@stayroanoke.com" className={styles.link}>Contact</a>
        <Link to="/search" className={styles.cta}>Book Now</Link>
      </div>
      <button
        ref={hamburgerRef}
        className={styles.hamburger}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen(o => !o)}
      >
        <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
      </button>
      {menuOpen && (
        <div id="mobile-menu" ref={menuRef} className={styles.mobileMenu} role="dialog" aria-label="Navigation menu" aria-modal="true">
          <Link to="/search" className={styles.mobileLink} onClick={closeMenu}>Properties</Link>
          <Link to="/partners" className={styles.mobileLink} onClick={closeMenu}>Partner Listings</Link>
          <Link to="/blog" className={styles.mobileLink} onClick={closeMenu}>Guide</Link>
          <Link to="/faq" className={styles.mobileLink} onClick={closeMenu}>FAQ</Link>
          <a href="mailto:info@stayroanoke.com" className={styles.mobileLink} onClick={closeMenu}>Contact</a>
          <Link to="/search" className={styles.mobileCta} onClick={closeMenu}>Book Now</Link>
        </div>
      )}
    </nav>
  )
}
