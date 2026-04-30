import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export function StayRoanokeLogo() {
  return (
    <svg width="220" height="52" viewBox="0 0 660 155" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="Stay Roanoke">
      <defs>
        <clipPath id="pinClipNav">
          <circle cx="381" cy="72" r="29"/>
        </clipPath>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap');`}</style>
      </defs>
      <text x="12" y="112" fontFamily="'Nunito', 'Trebuchet MS', sans-serif" fontSize="82" fontWeight="800" fill="#1B4F72" letterSpacing="-1">StayRoan</text>
      <text x="410" y="112" fontFamily="'Nunito', 'Trebuchet MS', sans-serif" fontSize="82" fontWeight="800" fill="#1B4F72" letterSpacing="-1">ke</text>
      <circle cx="381" cy="72" r="31" fill="#1B4F72"/>
      <polygon points="381,132 362,101 400,101" fill="#1B4F72"/>
      <circle cx="381" cy="72" r="25" fill="#ffffff"/>
      <polygon points="356,96 375,58 394,96" fill="#1B4F72" clipPath="url(#pinClipNav)"/>
      <polygon points="372,96 394,64 416,96" fill="#7BAFD4" clipPath="url(#pinClipNav)"/>
      <rect x="354" y="92" width="58" height="6" fill="#C8A97A" clipPath="url(#pinClipNav)"/>
      <polygon points="370,58 375,46 380,58" fill="#ffffff"/>
      <polygon points="375,47 377.2,54 384.5,54 378.8,58.5 381,65.5 375,61 369,65.5 371.2,58.5 365.5,54 372.8,54" fill="none" stroke="#C8A97A" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
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
