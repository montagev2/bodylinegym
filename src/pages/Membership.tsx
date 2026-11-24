import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPlans } from '../lib/api'
import { BUSINESS, PLAN_NOTE } from '../lib/business'
import type { GymPlan } from '../types'

const POPULAR_SLUG = 'half-yearly'

function PlanCard({ plan }: { plan: GymPlan }) {
  const isPopular = plan.slug === POPULAR_SLUG
  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in the ${plan.name} membership (₹${plan.price}) at Body Line Fitness Center, Nandakumar. Please share how to get started.`
  )

  return (
    <div
      className="card"
      style={{
        background: isPopular ? 'rgba(225, 29, 72, 0.04)' : 'var(--bg-card)',
        border: `1.5px solid ${isPopular ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '2rem 1.75rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isPopular && (
        <div
          style={{
            position: 'absolute',
            top: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary)',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.25rem 0.85rem',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}
        >
          Most Popular Plan
        </div>
      )}

      {/* Plan Title & Duration */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.6rem',
            textTransform: 'uppercase',
            color: '#ffffff',
            letterSpacing: '0.02em',
            marginBottom: '0.25rem',
          }}
        >
          {plan.name}
        </h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {plan.duration_months === 1 ? '30 Days Access' : `${plan.duration_months} Months Access`}
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '3.25rem',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {plan.price.toLocaleString('en-IN')}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            / {plan.duration_months === 1 ? 'mo' : `${plan.duration_months} mo`}
          </span>
        </div>
        {plan.admission_fee > 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            + ₹{plan.admission_fee.toLocaleString('en-IN')} admission fee (one-time)
          </div>
        ) : (
          <div style={{ color: '#4ade80', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
            Zero Admission Fee
          </div>
        )}
      </div>

      {/* Features List */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem', flex: 1 }}>
        {plan.features.map(feature => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${whatsappMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className={isPopular ? 'btn btn-primary' : 'btn btn-outline'}
        style={{ width: '100%', textAlign: 'center', padding: '0.85rem 1rem' }}
      >
        {plan.slug === 'personal-training' ? 'Book Personal Training' : 'Enroll on WhatsApp'}
      </a>
    </div>
  )
}

export default function Membership() {
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackPlans: GymPlan[] = [
    { id: '1', name: 'Monthly', slug: 'monthly', duration_months: 1, price: 600, admission_fee: 500, features: ['Full gym & weights access', 'Locker room & washroom', 'Cardio & HIIT zone', '24/7 flexible access'], is_active: true, sort_order: 1, created_at: '' },
    { id: '2', name: 'Quarterly', slug: 'quarterly', duration_months: 3, price: 1600, admission_fee: 500, features: ['Full gym access', 'Locker room & washroom', 'Boxing bag station', '24/7 access', '1 Free Trainer Guidance session'], is_active: true, sort_order: 2, created_at: '' },
    { id: '3', name: 'Half-Yearly', slug: 'half-yearly', duration_months: 6, price: 2800, admission_fee: 0, features: ['Full gym access', 'Zero admission fee', 'Boxing bag station', '24/7 access', '2 Free PT coaching sessions', 'Custom diet guidance'], is_active: true, sort_order: 3, created_at: '' },
    { id: '4', name: 'Annual', slug: 'annual', duration_months: 12, price: 5000, admission_fee: 0, features: ['Full gym access for 365 days', 'Zero admission fee', 'Lowest monthly cost (~₹416/mo)', '24/7 access', '5 Free PT coaching sessions', 'Personal diet & workout plan'], is_active: true, sort_order: 4, created_at: '' },
    { id: '5', name: 'Personal Training', slug: 'personal-training', duration_months: 1, price: 2000, admission_fee: 0, features: ['1-on-1 dedicated coach', 'Form & injury prevention', 'Custom progressive workout plan', 'Targeted bodybuilding / fat loss', 'Flexible daily timing'], is_active: true, sort_order: 5, created_at: '' },
  ]

  useEffect(() => {
    getPlans()
      .then(data => setPlans(data.length > 0 ? data : fallbackPlans))
      .catch(() => setPlans(fallbackPlans))
      .finally(() => setLoading(false))
  }, [])

  const displayPlans = plans.length > 0 ? plans : fallbackPlans

  return (
    <Layout>
      {/* Clean Hero */}
      <section
        style={{
          background: 'linear-gradient(to bottom, #121215, #09090b)',
          padding: '4rem 0 3rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="section-label">Membership Options</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            Transparent Plans
          </h1>
          <p className="section-subtitle">
            No lock-in contracts, no surprise fees. Straightforward training plans built for every budget in Nandakumar.
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
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {displayPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: '2.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            {PLAN_NOTE} · For custom group packages or personal training inquiries, chat directly with us on WhatsApp or call <a href={`tel:${BUSINESS.phoneRaw}`} style={{ color: '#ffffff', textDecoration: 'underline' }}>{BUSINESS.phone}</a>.
          </div>
        </div>
      </section>

      {/* Comparison Overview */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header text-center">
            <div className="section-label">All-Inclusive</div>
            <h2 className="section-title">What Every Member Gets</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Every active membership gives you complete access to all training facilities.
            </p>
          </div>

          <div className="grid-3" style={{ maxWidth: '960px', margin: '0 auto' }}>
            {[
              { title: '24/7 Access', desc: 'Work out on your time, morning or night, with full facility access.' },
              { title: 'Free Weights & Machines', desc: 'Olympic barbells, dumbbells up to 40kg, benches, and isolation cables.' },
              { title: 'Boxing Station', desc: 'Heavy leather bags for cardio boxing, kickboxing conditioning, and stress relief.' },
              { title: 'Locker & Clean Space', desc: 'Clean washrooms, personal cubbies, and well-ventilated training floor.' },
              { title: 'Trainer Support', desc: 'Guidance on correct lifting form, machine adjustments, and basic routine setup.' },
              { title: 'Progress Tracking', desc: 'Weight and body measurement check-ins to keep you accountable.' },
            ].map(item => (
              <div
                key={item.title}
                className="card"
                style={{ padding: '1.5rem', borderRadius: '12px' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    marginBottom: '0.35rem',
                  }}
                >
                  {item.title}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
