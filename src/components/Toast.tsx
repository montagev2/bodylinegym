import { useState, useEffect } from 'react'

export interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
}

let toastListener: ((toast: ToastMessage) => void) | null = null

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  if (toastListener) {
    toastListener({ id: Math.random().toString(), text, type })
  }
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; key: number } | null>(null)

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, key: Date.now() })
  }

  const hide = () => {
    setToast(null)
  }

  return { toast, showToast: show, hideToast: hide }
}

export function Toast({
  message,
  type = 'info',
  onClose,
  duration = 3200,
}: {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
  duration?: number
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const isSuccess = type === 'success'
  const isError = type === 'error'

  const borderColor = isSuccess ? '#10b981' : isError ? 'var(--primary, #dc2626)' : 'var(--gold, #d4a017)'
  const bgColor = isSuccess
    ? 'rgba(6, 78, 59, 0.95)'
    : isError
      ? 'rgba(127, 29, 29, 0.95)'
      : 'rgba(26, 26, 26, 0.96)'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        padding: '0.85rem 1.6rem',
        borderRadius: '9999px',
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '0.9rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        animation: 'fadeInUp 0.3s ease',
        backdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{isSuccess ? '✓' : isError ? '✕' : 'ℹ'}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          onClose?.()
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '0 0.25rem',
          marginLeft: '0.5rem',
          fontSize: '1rem',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
