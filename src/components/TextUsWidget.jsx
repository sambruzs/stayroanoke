import React, { useState, useEffect, useRef } from 'react'
import styles from './TextUsWidget.module.css'

const PHONE = '5407327151'
const SMS_HREF = `sms:+1${PHONE}`

export default function TextUsWidget() {
  const [open, setOpen] = useState(false)
  const popupRef = useRef(null)
  const bubbleRef = useRef(null)

  // Focus management + Escape for dialog
  useEffect(() => {
    if (!open) return
    const el = popupRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()

    function handleKey(e) {
      if (e.key !== 'Escape') return
      setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      bubbleRef.current?.focus()
    }
  }, [open])

  return (
    <div className={styles.launcher}>
      {open && (
        <div
          ref={popupRef}
          className={styles.popup}
          role="dialog"
          aria-modal="true"
          aria-label="Text us"
        >
          <div className={styles.popupHeader}>
            <span className={styles.popupBrand}>Stay Roanoke</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p className={styles.popupBody}>
            Have a question? Text us and we'll get back to you quickly.
          </p>
          <a href={SMS_HREF} className={styles.textBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Text us: (540) 732-7151
          </a>
        </div>
      )}
      <button
        ref={bubbleRef}
        className={styles.bubble}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Text us'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className={styles.bubbleLabel}>Text us</span>
          </>
        )}
      </button>
    </div>
  )
}
