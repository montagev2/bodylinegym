import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Toast, useToast } from '../components/Toast'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, profile } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  // If already logged in, redirect
  if (profile) {
    if (profile.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/portal', { replace: true })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const user = await login(phone, pin)
        showToast(`Welcome back, ${user.name}!`, 'success')
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin')
          } else {
            navigate('/portal')
          }
        }, 500)
      } else {
        await register(phone, pin, name)
        showToast('Member account created successfully!', 'success')
        setTimeout(() => {
          navigate('/portal')
        }, 500)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill for admin demo
  const fillAdmin = () => {
    setMode('login')
    setPhone('6294902384')
    setPin('1234')
  }

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <section style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '3rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.15,
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.06), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
          {/* Logo & Gym Branding */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{
                width: '52px',
                height: '52px',
                background: 'var(--primary)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.25rem',
                color: 'white',
              }}>
                BL
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-primary)',
                }}>
                  Body Line
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                  Portal & Master Control
                </div>
              </div>
            </Link>
          </div>

          {/* Glass Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Mode Switcher Tabs (Shanti Kutir style) */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '0.3rem',
              marginBottom: '1.75rem',
              border: '1px solid var(--border)',
            }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === 'login' ? 'var(--primary)' : 'transparent',
                  color: mode === 'login' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === 'register' ? 'var(--primary)' : 'transparent',
                  color: mode === 'register' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                New Member
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Full Name
                  </label>
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={mode === 'register'}
                    autoFocus={mode === 'register'}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 700 }}>
                  Mobile Number
                </label>
                <input
                  className="input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile (e.g. 6294902384)"
                  required
                  autoFocus={mode === 'login'}
                  maxLength={13}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    4-Digit Secret PIN
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {mode === 'login' ? 'Your security PIN' : 'Choose 4 digits'}
                  </span>
                </div>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  required
                  style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.3rem', fontWeight: 900 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  letterSpacing: '0.08em',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Login to Account' : 'Register Account'}
              </button>
            </form>

            {/* Admin Demo Helper Box */}
            <div style={{
              marginTop: '1.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              background: 'rgba(212,160,23,0.08)',
              border: '1px solid rgba(212,160,23,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Admin Master Access
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Phone: <strong>6294902384</strong> · PIN: <strong>1234</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={fillAdmin}
                style={{
                  background: 'var(--gold)',
                  color: '#080808',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.35rem 0.65rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
