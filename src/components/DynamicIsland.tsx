import { useState, useEffect, useRef } from 'react'

export type IslandVariant = 'success' | 'warning' | 'error' | 'info' | 'processing'

export interface IslandNotification {
  id: string
  variant: IslandVariant
  title: string
  subtitle?: string
  icon?: string
  duration?: number // ms, 0 = persistent
  action?: { label: string; onClick: () => void }
}

interface DynamicIslandProps {
  notification: IslandNotification | null
  onDismiss?: () => void
}

const VARIANT_STYLES: Record<IslandVariant, { bg: string; border: string; iconBg: string; dot: string }> = {
  success: {
    bg: 'linear-gradient(135deg, rgba(16,24,16,0.98) 0%, rgba(10,30,15,0.98) 100%)',
    border: 'rgba(74,222,128,0.35)',
    iconBg: 'rgba(74,222,128,0.15)',
    dot: '#4ade80',
  },
  warning: {
    bg: 'linear-gradient(135deg, rgba(28,20,6,0.98) 0%, rgba(28,16,4,0.98) 100%)',
    border: 'rgba(251,191,36,0.35)',
    iconBg: 'rgba(251,191,36,0.15)',
    dot: '#fbbf24',
  },
  error: {
    bg: 'linear-gradient(135deg, rgba(28,6,6,0.98) 0%, rgba(24,4,4,0.98) 100%)',
    border: 'rgba(239,68,68,0.35)',
    iconBg: 'rgba(239,68,68,0.15)',
    dot: '#ef4444',
  },
  info: {
    bg: 'linear-gradient(135deg, rgba(6,16,28,0.98) 0%, rgba(4,12,24,0.98) 100%)',
    border: 'rgba(96,165,250,0.35)',
    iconBg: 'rgba(96,165,250,0.15)',
    dot: '#60a5fa',
  },
  processing: {
    bg: 'linear-gradient(135deg, rgba(10,10,16,0.98) 0%, rgba(14,10,20,0.98) 100%)',
    border: 'rgba(167,139,250,0.35)',
    iconBg: 'rgba(167,139,250,0.15)',
    dot: '#a78bfa',
  },
}

export default function DynamicIsland({ notification, onDismiss }: DynamicIslandProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (notification) {
      setExiting(false)
      setVisible(true)
      setExpanded(false)

      // Auto-expand after short delay
      expandTimerRef.current = setTimeout(() => setExpanded(true), 60)

      // Auto-dismiss
      const dur = notification.duration ?? 4000
      if (dur > 0) {
        timerRef.current = setTimeout(() => dismiss(), dur)
      }
    } else {
      dismiss()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    }
  }, [notification])

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setExpanded(false)
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      setExiting(false)
      onDismiss?.()
    }, 400)
  }

  if (!visible || !notification) return null

  const style = VARIANT_STYLES[notification.variant]

  return (
    <div
      style={{
        position: 'fixed',
        top: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={notification.duration === 0 ? undefined : dismiss}
        style={{
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: expanded ? '20px' : '32px',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)`,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          overflow: 'hidden',
          cursor: notification.duration === 0 ? 'default' : 'pointer',
          transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: expanded ? 'min(340px, calc(100vw - 32px))' : '120px',
          height: expanded ? 'auto' : '36px',
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'scale(0.8) translateY(-8px)' : 'scale(1) translateY(0)',
          minHeight: '36px',
        }}
      >
        {/* Collapsed pill state - just a dot */}
        {!expanded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '36px',
            gap: '6px',
            padding: '0 12px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: style.dot,
              boxShadow: `0 0 8px ${style.dot}`,
              animation: notification.variant === 'processing' ? 'pulse 1s infinite' : undefined,
            }} />
          </div>
        )}

        {/* Expanded state */}
        {expanded && (
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Icon */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: style.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              border: `1px solid ${style.border}`,
            }}>
              {notification.icon || (
                notification.variant === 'success' ? '✓' :
                notification.variant === 'error' ? '✕' :
                notification.variant === 'warning' ? '⚠' :
                notification.variant === 'processing' ? '⟳' : 'ℹ'
              )}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.3,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}>
                {notification.title}
              </div>
              {notification.subtitle && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: '2px',
                  lineHeight: 1.4,
                }}>
                  {notification.subtitle}
                </div>
              )}
              {notification.action && (
                <button
                  onClick={e => { e.stopPropagation(); notification.action!.onClick() }}
                  style={{
                    marginTop: '8px',
                    background: style.iconBg,
                    border: `1px solid ${style.border}`,
                    color: style.dot,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            {/* Dismiss dot */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: style.dot,
              boxShadow: `0 0 10px ${style.dot}`,
              flexShrink: 0,
              marginTop: '4px',
              animation: notification.variant === 'processing' ? 'pulse 1s infinite' : undefined,
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

// Global hook for triggering Dynamic Island notifications from anywhere
let _setIsland: ((n: IslandNotification | null) => void) | null = null

export function useDynamicIsland() {
  return {
    show: (n: Omit<IslandNotification, 'id'>) => {
      _setIsland?.({ ...n, id: Date.now().toString() })
    },
    dismiss: () => _setIsland?.(null),
  }
}

export function DynamicIslandProvider() {
  const [notification, setNotification] = useState<IslandNotification | null>(null)

  useEffect(() => {
    _setIsland = setNotification
    return () => { _setIsland = null }
  }, [])

  return (
    <DynamicIsland
      notification={notification}
      onDismiss={() => setNotification(null)}
    />
  )
}
