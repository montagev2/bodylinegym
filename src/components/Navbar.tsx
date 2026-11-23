import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/membership', label: 'Membership' },
    { to: '/trainers', label: 'Trainers' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/contact', label: 'Contact' },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(8,8,8,0.97)'
          : 'linear-gradient(to bottom, rgba(8,8,8,0.9), transparent)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '72px', gap: '2rem' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1rem',
            color: 'white',
            flexShrink: 0,
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
              lineHeight: 1.1,
            }}>
              Body Line
            </div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              lineHeight: 1,
            }}>
              Fitness Center
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.5rem 0.875rem',
                borderRadius: '4px',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'color 0.2s',
                textDecoration: 'none',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }} className="desktop-nav">
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                  ★ Admin Panel
                </Link>
              ) : (
                <Link to="/portal" className="btn btn-outline btn-sm">
                  My Portal
                </Link>
              )}
              <button onClick={handleSignOut} className="btn btn-primary btn-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-outline btn-sm">Sign In / Admin</Link>
              <a
                href="https://wa.me/916294902384?text=Hi!%20I'm%20interested%20in%20joining%20Body%20Line%20Fitness%20Center."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Join Now
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          style={{
            marginLeft: 'auto',
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: 'var(--text-primary)',
            transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: 'var(--text-primary)',
            opacity: menuOpen ? 0 : 1,
            transition: 'opacity 0.3s',
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: 'var(--text-primary)',
            transition: 'all 0.3s',
            transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            inset: 0,
            top: '72px',
            background: 'var(--bg-main)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 999,
            overflowY: 'auto',
          }}
        >
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '2rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.5rem 0',
                color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--border)',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="btn btn-outline" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                    ★ Admin Panel
                  </Link>
                ) : (
                  <Link to="/portal" onClick={() => setMenuOpen(false)} className="btn btn-outline">
                    My Portal
                  </Link>
                )}
                <button onClick={handleSignOut} className="btn btn-primary">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn btn-outline">Sign In / Admin</Link>
                <a
                  href="https://wa.me/916294902384?text=Hi!%20I'm%20interested%20in%20joining%20Body%20Line%20Fitness%20Center."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Join Now on WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
