import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export function StayRoanokeLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: '28px',
        color: '#1B4F72',
        letterSpacing: '0px',
        whiteSpace: 'nowrap',
      }}>
        StayRoan
      </span>

      <svg
        width="28" height="38"
        viewBox="0 0 56 76"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', margin: '0 -1px', flexShrink: 0 }}
      >
        <circle cx="28" cy="26" r="26" fill="#1B4F72"/>
        <polygon points="28,72 14,50 42,50" fill="#1B4F72"/>
        <circle cx="28" cy="26" r="20" fill="white"/>
        <clipPath id="pc">
          <circle cx="28" cy="26" r="19"/>
        </clipPath>
        <polygon points="10,44 28,10 46,44" fill="#7BAFD4" clipPath="url(#pc)"/>
        <polygon points="18,44 36,18 54,44" fill="#1B4F72" clipPath="url(#pc)"/>
        <rect x="8" y="40" width="42" height="5" fill="#C8A97A" clipPath="url(#pc)"/>
        <polygon points="24,10 28,2 32,10" fill="white"/>
        <polygon
          points="28,1 30,8 37,8 31.5,12.5 33.5,19.5 28,15.5 22.5,19.5 24.5,12.5 19,8 26,8"
          fill="none"
          stroke="#C8A97A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <span style={{
        fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: '28px',
        color: '#1B4F72',
        letterSpacing: '0px',
        whiteSpace: 'nowrap',
      }}>
        ke
      </span>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled

  return (
    <nav className={`${styles.nav} ${transparent ? styles.transparent : styles.solid}`}>
      <Link to="/" className={styles.logo}>
        <StayRoanokeLogo />
      </Link>
      <div className={styles.links}>
        <Link to="/search" className={styles.link}>All Properties</Link>
        <a href="mailto:hello@stayroanoke.com" className={styles.link}>Contact</a>
        <Link to="/search" className={styles.cta}>Book Now</Link>
      </div>
    </nav>
  )
}
