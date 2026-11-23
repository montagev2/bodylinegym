import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { getPlans } from '../lib/api'
import { BUSINESS, PLAN_NOTE, WHATSAPP_JOIN_URL } from '../lib/business'
import type { GymPlan } from '../types'

const PLAN_ICONS: Record<string, string> = {
  monthly: 'M',
  quarterly: 'Q',
  'half-yearly': 'H',
  annual: 'A',
  'personal-training': 'PT',
}

const POPULAR_SLUG = 'half-yearly'

function PlanCard({ plan }: { plan: GymPlan }) {
  const isPopular = plan.slug === POPULAR_SLUG
  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in the ${plan.name} membership at Body Line Fitness Center, Nandakumar. Please share details.`
  )

  return (
    <div style={{
      background: isPopular ? 'linear-gradient(145deg, #1a0505, #1f0808)' : 'var(--bg-card)',
      border: `2px solid ${isPopular ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = isPopular ? 'var(--shadow-red)' : 'var(--shadow-lg)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--gold)',
          color: '#000',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '0.3rem 1rem',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
        }}>
          Best Value
        </div>
      )}

      {/* Plan icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: isPopular ? 'var(--primary)' : 'rgba(220,38,38,0.1)',
          border: `1px solid ${isPopular ? 'var(--primary)' : 'rgba(220,38,38,0.25)'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '1rem',
          color: isPopular ? 'white' : 'var(--primary)',
          flexShrink: 0,
        }}>
          {PLAN_ICONS[plan.slug] ?? 'G'}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.3rem',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            {plan.name}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {plan.duration_months === 1 ? '1 Month' : `${plan.duration_months} Months`}
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-secondary)' }}></span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '3rem',
            color: isPopular ? 'var(--primary)' : 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {plan.price.toLocaleString('en-IN')}
          </span>
        </div>
        {plan.admission_fee > 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            + {plan.admission_fee.toLocaleString('en-IN')} admission fee (one-time)
          </div>
        )}
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem', flex: 1 }}>
        {plan.features.map(feature => (
          <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              color: '#4ade80',
              flexShrink: 0,
            }}>
              {'\u2713'}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${whatsappMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className={isPopular ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ width: '100%', textAlign: 'center' }}
      >
        {plan.slug === 'personal-training' ? 'Book a Session' : 'Enroll Now'}
      </a>
    </div>
  )
}

export default function Membership() {
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load plans'))
      .finally(() => setLoading(false))
  }, [])

  // Fallback static plans if DB not ready
  const fallbackPlans: GymPlan[] = [
    { id: '1', name: 'Monthly', slug: 'monthly', duration_months: 1, price: 600, admission_fee: 500, features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access'], is_active: true, sort_order: 1, created_at: '' },
    { id: '2', name: 'Quarterly', slug: 'quarterly', duration_months: 3, price: 1600, admission_fee: 500, features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', 'Free 1 PT session'], is_active: true, sort_order: 2, created_at: '' },
    { id: '3', name: 'Half-Yearly', slug: 'half-yearly', duration_months: 6, price: 2800, admission_fee: 0, features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', '2 Free PT sessions', 'Diet consultation'], is_active: true, sort_order: 3, created_at: '' },
    { id: '4', name: 'Annual', slug: 'annual', duration_months: 12, price: 5000, admission_fee: 0, features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', '5 Free PT sessions', 'Diet plan', 'Priority booking'], is_active: true, sort_order: 4, created_at: '' },
    { id: '5', name: 'Personal Training', slug: 'personal-training', duration_months: 1, price: 2000, admission_fee: 0, features: ['1-on-1 trainer', 'Custom workout plan', 'Diet consultation', 'Progress tracking', 'Flexible timing'], is_active: true, sort_order: 5, created_at: '' },
  ]

  const displayPlans = plans.length > 0 ? plans : fallbackPlans

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
          <div className="section-label">Pricing</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Membership Plans</h1>
          <p className="section-subtitle">
            No contracts, no hidden fees. Choose the plan that fits your goals and budget.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              <p>Using cached plan data.</p>
            </div>
          ) : null}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {displayPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
            {PLAN_NOTE}
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label">Compare</div>
            <h2 className="section-title">What's Included</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Feature</th>
                  {['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'].map(p => (
                    <th key={p} style={{
                      padding: '1rem',
                      color: p === 'Half-Yearly' ? 'var(--primary)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                    }}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Full Gym Access', true, true, true, true],
                  ['Locker Room', true, true, true, true],
                  ['Cardio Zone', true, true, true, true],
                  ['24/7 Access', true, true, true, true],
                  ['Free PT Session', false, '1', '2', '5'],
                  ['Diet Consultation', false, false, true, true],
                  ['Personal Diet Plan', false, false, false, true],
                  ['Priority Booking', false, false, false, true],
                  ['Admission Fee', '500', '500', 'None', 'None'],
                ].map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>{row[0]}</td>
                    {[1, 2, 3, 4].map(j => (
                      <td key={j} style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {row[j] === true ? (
                          <span style={{ color: '#4ade80', fontSize: '1rem' }}>{'\u2713'}</span>
                        ) : row[j] === false ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{'\u2014'}</span>
                        ) : (
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{row[j]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Not Sure Which Plan?</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
            Message us on WhatsApp and we'll help you pick the right plan based on your goals.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={WHATSAPP_JOIN_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
              Ask on WhatsApp
            </a>
            <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
