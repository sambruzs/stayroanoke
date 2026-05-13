import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.mountains}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C120,60 160,30 240,28 C320,26 360,45 440,40 C520,35 560,18 640,20 C720,22 760,42 840,38 C920,34 960,16 1040,18 C1120,20 1160,40 1240,36 C1320,32 1380,48 1440,44 L1440,80 L0,80 Z" fill="#1B4F72" opacity="0.4"/>
          <path d="M0,68 C100,68 140,45 220,42 C300,39 340,58 420,53 C500,48 540,30 620,32 C700,34 740,54 820,50 C900,46 940,28 1020,30 C1100,32 1140,52 1220,48 C1300,44 1380,58 1440,55 L1440,80 L0,80 Z" fill="#1B4F72" opacity="0.7"/>
          <path d="M0,72 C80,72 120,55 200,52 C280,49 320,65 400,61 C480,57 520,42 600,44 C680,46 720,62 800,58 C880,54 920,38 1000,40 C1080,42 1120,58 1200,55 C1280,52 1380,65 1440,62 L1440,80 L0,80 Z" fill="#1B4F72"/>
        </svg>
      </div>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>STAY ROANOKE</span>
          <p className={styles.tagline}>Your Blue Ridge Mountain Getaway</p>
        </div>
        <div className={styles.cols}>
          <div className={styles.col}>
            <h4>Explore</h4>
            <Link to="/search">All Properties</Link>
            <Link to="/search?guests=2">Couples Retreats</Link>
            <Link to="/search?guests=8">Group Stays</Link>
          </div>
          <div className={styles.col}>
            <h4>Roanoke</h4>
            <a href="https://www.visitroanokeva.com" target="_blank" rel="noreferrer">Visit Roanoke</a>
            <a href="https://www.nps.gov/blri" target="_blank" rel="noreferrer">Blue Ridge Parkway</a>
            <a href="https://www.roanokeoutside.com" target="_blank" rel="noreferrer">Roanoke Outside</a>
          </div>
          <div className={styles.col}>
            <h4>Contact</h4>
            <a href="mailto:info@stayroanoke.com">info@stayroanoke.com</a>
            <a href="tel:+15407327151">(540) 732-7151</a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Stay Roanoke. All rights reserved.</span>
        <Link to="/terms" style={{ color: 'inherit', opacity: 0.7, textDecoration: 'none', fontSize: '0.85rem' }}>Terms &amp; Conditions</Link>
      </div>
    </footer>
  )
}
