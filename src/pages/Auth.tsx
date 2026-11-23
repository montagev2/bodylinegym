import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { BUSINESS } from '../lib/business'

type Step = 'phone' | 'otp'

export default function Auth() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithPhone, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length >= 12) return `+${digits}`
    if (digits.length === 10) return `+91${digits}`
    return `+${digits}`
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const formatted = formatPhone(phone)
    if (formatted.length < 12) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      await signInWithPhone(formatted)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      await verifyOtp(formatPhone(phone), otp)
      navigate('/portal')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
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
        {/* Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.2,
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.05), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Body Line
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Member Portal
                </div>
              </div>
            </Link>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2.5rem',
          }}>
            {step === 'phone' ? (
              <>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  Member Login
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                  Enter your registered mobile number to receive a one-time password.
                </p>

                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      Mobile Number
                    </label>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      autoFocus
                    />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                      Your registered gym mobile number
                    </p>
                  </div>

                  {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '6px', color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Enter OTP
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                  A 6-digit code was sent to <strong style={{ color: 'var(--text-primary)' }}>{formatPhone(phone)}</strong>
                </p>

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      One-Time Password
                    </label>
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      required
                      autoFocus
                      style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.5rem' }}
                    />
                  </div>

                  {error && (
                    <div style={{ padding: '0.75rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '6px', color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change phone number
                  </button>
                </form>
              </>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Not a member yet?{' '}
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%27m%20interested%20in%20joining%20Body%20Line%20Fitness%20Center.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Join on WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
