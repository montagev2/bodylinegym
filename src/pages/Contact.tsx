import { useState, type FormEvent } from 'react'
import Layout from '../components/Layout'
import { submitInquiry } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymInquiry } from '../types'

type InquiryType = GymInquiry['inquiry_type']

const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: 'membership', label: 'Membership Inquiry' },
  { value: 'trial', label: 'Book Free Trial' },
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'general', label: 'General Question' },
  { value: 'other', label: 'Other' },
]

export default function Contact() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    message: '',
    inquiry_type: 'membership' as InquiryType,
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.phone) return
    setStatus('submitting')
    try {
      await submitInquiry({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        message: form.message || null,
        inquiry_type: form.inquiry_type,
      })
      setStatus('success')
      setForm({ full_name: '', phone: '', email: '', message: '', inquiry_type: 'membership' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit. Please try WhatsApp instead.')
    }
  }

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  return (
    <Layout>
      {/* Hero */}
      <section style={{
        background: 'var(--bg-main)',
        padding: '5rem 0 3rem',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.2,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label">Get in Touch</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Contact Us</h1>
          <p className="section-subtitle">
            Have questions? Ready to join? We respond fast — or just WhatsApp us directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

            {/* Contact Info */}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '2rem',
                textTransform: 'uppercase',
                marginBottom: '2rem',
              }}>
                Find Us
              </h2>

              {/* Info blocks */}
              {[
                {
                  label: 'Phone',
                  content: (
                    <a href={`tel:${BUSINESS.phoneRaw}`} style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, textDecoration: 'none' }}>
                      {BUSINESS.phone}
                    </a>
                  ),
                },
                {
                  label: 'Hours',
                  content: <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '1.1rem' }}>{BUSINESS.hours}</span>,
                },
                {
                  label: 'Address',
                  content: (
                    <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', lineHeight: 1.7 }}>
                      {BUSINESS.address}
                    </a>
                  ),
                },
                {
                  label: 'Plus Code',
                  content: <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{BUSINESS.plusCode}</span>,
                },
              ].map(({ label, content }) => (
                <div key={label} style={{
                  display: 'flex',
                  gap: '1.25rem',
                  marginBottom: '1.75rem',
                  paddingBottom: '1.75rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'rgba(220,38,38,0.1)',
                    border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.6rem',
                    color: 'var(--primary)',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}>
                    {label.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                      {label}
                    </div>
                    {content}
                  </div>
                </div>
              ))}

              {/* Quick actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%27m%20interested%20in%20joining%20Body%20Line%20Fitness%20Center.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Get Directions on Maps
                </a>
              </div>

              {/* Map embed */}
              <div style={{ marginTop: '2rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <iframe
                  title="Body Line Fitness Center Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3706.4!2d87.9204!3d22.2003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02cdd879999999%3A0x9!2sBody+Line+Fitness+Center!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: 'block', filter: 'invert(0.9) hue-rotate(180deg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2.5rem',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  Send a Message
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                  We'll get back to you within a few hours.
                </p>

                {status === 'success' ? (
                  <div style={{
                    padding: '2rem',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{'✓'}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.5rem' }}>
                      Message Received!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      We'll contact you at {form.phone || 'your number'} shortly. For faster response, WhatsApp us directly.
                    </p>
                    <button onClick={() => setStatus('idle')} className="btn btn-outline" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Inquiry type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Type of Inquiry
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {INQUIRY_TYPES.map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => update('inquiry_type', type.value)}
                            style={{
                              padding: '0.4rem 0.875rem',
                              borderRadius: '6px',
                              border: `1px solid ${form.inquiry_type === type.value ? 'var(--primary)' : 'var(--border)'}`,
                              background: form.inquiry_type === type.value ? 'rgba(220,38,38,0.12)' : 'var(--bg-elevated)',
                              color: form.inquiry_type === type.value ? 'var(--primary)' : 'var(--text-secondary)',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Full Name *
                      </label>
                      <input
                        className="input"
                        type="text"
                        value={form.full_name}
                        onChange={e => update('full_name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Phone Number *
                      </label>
                      <input
                        className="input"
                        type="tel"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Email (optional)
                      </label>
                      <input
                        className="input"
                        type="email"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        Message (optional)
                      </label>
                      <textarea
                        className="input"
                        value={form.message}
                        onChange={e => update('message', e.target.value)}
                        placeholder="Tell us your fitness goals or any specific questions..."
                        rows={4}
                        style={{ resize: 'vertical', minHeight: '100px' }}
                      />
                    </div>

                    {status === 'error' && (
                      <div style={{
                        padding: '0.875rem',
                        background: 'rgba(220,38,38,0.08)',
                        border: '1px solid rgba(220,38,38,0.25)',
                        borderRadius: '6px',
                        color: 'var(--primary-light)',
                        fontSize: '0.85rem',
                      }}>
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn btn-primary"
                      style={{ opacity: status === 'submitting' ? 0.7 : 1 }}
                    >
                      {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                      Or reach us instantly on WhatsApp: {BUSINESS.phone}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
