import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import { StayRoanokeLogo } from './Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
        <a href="mailto:info@stayroanoke.com" className={styles.link}>Contact</a>
        <Link to="/search" className={styles.cta}>Book Now</Link>
      </div>
      <button
        className={styles.hamburger}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(o => !o)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/search" className={styles.mobileLink} onClick={closeMenu}>Properties</Link>
          <Link to="/partners" className={styles.mobileLink} onClick={closeMenu}>Partner Listings</Link>
          <Link to="/blog" className={styles.mobileLink} onClick={closeMenu}>Guide</Link>
          <a href="mailto:info@stayroanoke.com" className={styles.mobileLink} onClick={closeMenu}>Contact</a>
          <Link to="/search" className={styles.mobileCta} onClick={closeMenu}>Book Now</Link>
        </div>
      )}
    </nav>
  )
}
