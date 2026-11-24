import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CheckoutModal from '../components/CheckoutModal'
import { getPlans } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymPlan } from '../types'

const POPULAR_SLUG = 'half-yearly'

interface PlanCardProps {
  plan: GymPlan
  onBuy: (plan: GymPlan) => void
}

function PlanCard({ plan, onBuy }: PlanCardProps) {
  const isPopular = plan.slug === POPULAR_SLUG
  const whatsappMsg = encodeURIComponent(
    `Hi! I have a question about the ${plan.name} membership (₹${plan.price}) at Body Line Fitness Center, Nandakumar.`
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
        boxShadow: isPopular ? '0 12px 32px rgba(225, 29, 72, 0.15)' : 'none',
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
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
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

      {/* Primary Action: Direct Buy/Subscribe */}
      <button
        type="button"
        onClick={() => onBuy(plan)}
        className={isPopular ? 'btn btn-primary' : 'btn btn-outline'}
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '0.9rem 1rem',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '0.98rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          border: isPopular ? 'none' : '1.5px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {plan.slug === 'personal-training' ? 'Buy PT Coaching Pass' : `Buy ${plan.name} Pass`}
      </button>

      {/* Secondary Action: WhatsApp inquiry for questions */}
      <a
        href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${whatsappMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          marginTop: '0.75rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        💬 Have questions? Inquire on WhatsApp
      </a>
    </div>
  )
}

export default function Membership() {
  const [searchParams] = useSearchParams()
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<GymPlan | null>(null)

  const fallbackPlans: GymPlan[] = [
    { id: '1', name: 'Monthly', slug: 'monthly', duration_months: 1, price: 600, admission_fee: 500, features: ['Full gym & weights access', 'Locker room & washroom', 'Cardio & HIIT zone', '24/7 flexible access'], is_active: true, sort_order: 1, created_at: '' },
    { id: '2', name: 'Quarterly', slug: 'quarterly', duration_months: 3, price: 1600, admission_fee: 500, features: ['Full gym access', 'Locker room & washroom', 'Boxing bag station', '24/7 access', '1 Free Trainer Guidance session'], is_active: true, sort_order: 2, created_at: '' },
    { id: '3', name: 'Half-Yearly', slug: 'half-yearly', duration_months: 6, price: 2800, admission_fee: 0, features: ['Full gym access', 'Zero admission fee', 'Boxing bag station', '24/7 access', '2 Free PT coaching sessions', 'Custom diet guidance'], is_active: true, sort_order: 3, created_at: '' },
    { id: '4', name: 'Annual', slug: 'annual', duration_months: 12, price: 5000, admission_fee: 0, features: ['Full gym access for 365 days', 'Zero admission fee', 'Lowest monthly cost (~₹416/mo)', '24/7 access', '5 Free PT coaching sessions', 'Personal diet & workout plan'], is_active: true, sort_order: 4, created_at: '' },
    { id: '5', name: 'Personal Training', slug: 'personal-training', duration_months: 1, price: 2000, admission_fee: 0, features: ['1-on-1 dedicated coach', 'Form & injury prevention', 'Custom progressive workout plan', 'Targeted bodybuilding / fat loss', 'Flexible daily timing'], is_active: true, sort_order: 5, created_at: '' },
  ]

  useEffect(() => {
    getPlans()
      .then(data => {
        const activePlans = data.length > 0 ? data : fallbackPlans
        setPlans(activePlans)

        // Check if query parameter has a requested plan: e.g. /membership?plan=half-yearly
        const requestedSlug = searchParams.get('plan')
        if (requestedSlug) {
          const matched = activePlans.find(p => p.slug === requestedSlug)
          if (matched) {
            setCheckoutPlan(matched)
          }
        }
      })
      .catch(() => setPlans(fallbackPlans))
      .finally(() => setLoading(false))
  }, [searchParams])

  const displayPlans = plans.length > 0 ? plans : fallbackPlans

  return (
    <Layout>
      {/* Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
        />
      )}

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
            No lock-in contracts, no surprise fees. Straightforward training plans with instant online subscription &amp; UPI activation.
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
                <PlanCard key={plan.id} plan={plan} onBuy={p => setCheckoutPlan(p)} />
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <strong style={{ color: '#ffffff' }}>Instant Digital Member Pass:</strong> When you buy online, your digital member pass is activated immediately in your portal with UPI or Cash reservation.
            </div>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to ask a custom question about Body Line Fitness Center.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              Chat With Desk
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
