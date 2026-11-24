import { BUSINESS } from '../lib/business'

export default function MobileActionBar() {
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    "Hi! I'm interested in joining Body Line Fitness Center, Nandakumar. Please share membership details."
  )}`

  return (
    <div
      className="mobile-action-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(9, 9, 11, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px))',
        display: 'none',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.65rem', maxWidth: '500px', margin: '0 auto' }}>
        <a
          href={`tel:${BUSINESS.phoneRaw}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.65rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            minHeight: '44px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Call Gym
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 0.75rem',
            borderRadius: '8px',
            background: '#15803d',
            border: '1px solid #166534',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            minHeight: '44px',
            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.193-.564-1.782-.746-2.909-2.57-2.997-2.689-.089-.119-.728-.971-.728-1.853 0-.882.46-1.316.623-1.492.164-.176.356-.22.475-.22.12 0 .239.001.343.007.11.006.257-.042.403.308.15.361.512 1.25.556 1.341.045.091.074.198.015.317-.059.119-.089.193-.178.297-.089.104-.187.233-.267.313-.089.089-.182.186-.078.365.104.179.462.763.992 1.235.683.608 1.258.796 1.437.886.179.089.284.074.39-.045.105-.119.45-.523.57-.702.12-.179.239-.149.403-.089.164.06 1.042.492 1.221.581.179.089.298.134.343.209.044.074.044.432-.1 1.037z"/>
          </svg>
          WhatsApp Us
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-action-bar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
