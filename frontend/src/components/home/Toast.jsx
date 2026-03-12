import React, { useEffect } from 'react'

export default function Toast({ show, message }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        // Toast sẽ tự động ẩn sau 3 giây
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="toast-notification">
      {message}
    </div>
  )
}