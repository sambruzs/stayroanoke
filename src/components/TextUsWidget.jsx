import React, { useState } from 'react'
import styles from './TextUsWidget.module.css'

const PHONE = '5407327151'
const SMS_HREF = `sms:+1${PHONE}`

export default function TextUsWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.launcher}>
      {open && (
        <div className={styles.popup} role="dialog" aria-label="Text us">
          <div className={styles.popupHeader}>
            <span className={styles.popupBrand}>Stay Roanoke</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
          <p className={styles.popupBody}>
            Have a question? Text us and we'll get back to you quickly.
          </p>
          <a href={SMS_HREF} className={styles.textBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Text us: (540) 732-7151
          </a>
        </div>
      )}
      <button
        className={styles.bubble}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Text us'}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </div>
  )
}
