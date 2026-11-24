import { useState, type FormEvent } from 'react'
import Layout from '../components/Layout'
import { submitInquiry } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymInquiry } from '../types'

type InquiryType = GymInquiry['inquiry_type']

const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: 'membership', label: 'Membership Inquiry' },
  { value: 'trial', label: 'Book Free Trial' },
  { value: 'personal_training', label: 'Personal Coaching' },
  { value: 'general', label: 'General Question' },
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit. Please chat on WhatsApp directly.')
    }
  }

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  return (
    <Layout>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(to bottom, #121215, #09090b)',
          padding: '4rem 0 2.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="section-label">Connect with Us</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            Contact &amp; Location
          </h1>
          <p className="section-subtitle">
            Have questions about our plans or want to tour the facility? Drop in anytime or send a quick WhatsApp.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'start',
            }}
            className="contact-layout"
          >
            {/* Left: Contact Details */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  marginBottom: '1.5rem',
                }}
              >
                Gym Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 700 }}>
                    Direct Phone / WhatsApp
                  </div>
                  <a
                    href={`tel:${BUSINESS.phoneRaw}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      color: '#ffffff',
                      textDecoration: 'none',
                    }}
                  >
                    {BUSINESS.phone}
                  </a>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Available on Call &amp; WhatsApp 24/7
                  </div>
                </div>

                <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 700 }}>
                    Opening Hours
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#4ade80' }}>
                    Open 24 Hours · Every Day
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Coached Batches: Morning 5:00 AM – 9:30 AM | Evening 4:30 PM – 9:30 PM
                  </div>
                </div>

                <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 700 }}>
                    Gym Location
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {BUSINESS.address}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Landmark: Near Basudevpur Maharaj High School &amp; Jana Steel Furnitures
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <a
                  href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
                    "Hi! I'd like to ask a question about Body Line Fitness Center, Nandakumar."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  WhatsApp Direct
                </a>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Get Directions
                </a>
              </div>

              {/* Map Embed */}
              <div
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  aspectRatio: '16/10',
                  background: 'var(--bg-card)',
                }}
              >
                <iframe
                  title="Body Line Fitness Center Location"
                  src={BUSINESS.mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Right: Message Form */}
            <div>
              <div
                className="card"
                style={{
                  padding: '2.25rem 2rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '1.6rem',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    marginBottom: '0.35rem',
                  }}
                >
                  Send a Message
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                  Leave your number and what you need — we will call or text you on WhatsApp within a few hours.
                </p>

                {status === 'success' ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ade80',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                      Message Received!
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                      Thank you! Our trainer or manager will reach out to your mobile number shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 700 }}>
                        Your Full Name *
                      </label>
                      <input
                        className="input"
                        type="text"
                        value={form.full_name}
                        onChange={e => update('full_name', e.target.value)}
                        placeholder="e.g. Rahul Sen"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 700 }}>
                        Mobile Number (WhatsApp Preferred) *
                      </label>
                      <input
                        className="input"
                        type="tel"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 700 }}>
                        What Are You Interested In?
                      </label>
                      <select
                        className="input"
                        value={form.inquiry_type}
                        onChange={e => update('inquiry_type', e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        {INQUIRY_TYPES.map(t => (
                          <option key={t.value} value={t.value} style={{ background: '#121215', color: '#ffffff' }}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 700 }}>
                        Optional Note / Message
                      </label>
                      <textarea
                        className="input"
                        rows={3}
                        value={form.message}
                        onChange={e => update('message', e.target.value)}
                        placeholder="e.g. What is the fee for evening weight training batch?"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    {status === 'error' && (
                      <div style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn btn-primary"
                      style={{ width: '100%', minHeight: '48px', fontSize: '0.95rem' }}
                    >
                      {status === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .contact-layout {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
          }
        `}</style>
      </section>
    </Layout>
  )
}
