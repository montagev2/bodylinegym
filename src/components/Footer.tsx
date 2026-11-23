import { Link } from 'react-router-dom'
import { BUSINESS } from '../lib/business'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: '#080808',
      borderTop: '1px solid var(--border)',
      paddingTop: '4rem',
      paddingBottom: '2rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'var(--primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.1rem',
                color: 'white',
              }}>
                BL
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}>
                  Body Line
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                }}>
                  Fitness Center
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {BUSINESS.nameBengali} — Premium fitness facility in Nandakumar, West Bengal. Build your strength, forge your limits.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.875rem',
              borderRadius: '999px',
              background: 'rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.3)',
            }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>{'★'.repeat(5)}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                {BUSINESS.rating} / 5 on Google
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              marginBottom: '1.25rem',
            }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/membership', label: 'Membership Plans' },
                { to: '/trainers', label: 'Our Trainers' },
                { to: '/schedule', label: 'Class Schedule' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              marginBottom: '1.25rem',
            }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Phone</div>
                <a
                  href={`tel:${BUSINESS.phoneRaw}`}
                  style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}
                >
                  {BUSINESS.phone}
                </a>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Hours</div>
                <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>{BUSINESS.hours}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Address</div>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, textDecoration: 'none' }}
                >
                  {BUSINESS.address}
                </a>
              </div>
            </div>
          </div>

          {/* Join CTA */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              marginBottom: '1.25rem',
            }}>
              Start Today
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Ready to transform your body? Contact us on WhatsApp and start your fitness journey today.
            </p>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%27m%20interested%20in%20joining%20Body%20Line%20Fitness%20Center%2C%20Nandakumar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Join on WhatsApp
            </a>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ width: '100%', textAlign: 'center', marginTop: '0.75rem' }}
            >
              View on Maps
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            &copy; {year} Body Line Fitness Center, Nandakumar. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/auth" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
              Member Login
            </Link>
            <Link to="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
