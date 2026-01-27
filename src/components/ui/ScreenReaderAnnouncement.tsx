'use client'
import { useEffect, useState } from 'react'

export function ScreenReaderAnnouncement({ message }: { message: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (message) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}
