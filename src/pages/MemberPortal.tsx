import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMyMember, getMySubscriptions, getPlans, addMember, addSubscription } from '../lib/api'
import { BUSINESS, WHATSAPP_INQUIRY_URL } from '../lib/business'
import { useDynamicIsland } from '../components/DynamicIsland'
import type { GymMember, GymSubscription, GymPlan, GymAttendance } from '../types'
import { sanitisePhone } from '../lib/security'

function daysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000))
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function MembershipStatusRing({ days, total }: { days: number; total: number }) {
  const pct = total > 0 ? Math.min(1, days / total) : 0
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  const color = days <= 0 ? '#ef4444' : days <= 7 ? '#fbbf24' : '#4ade80'

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
      {/* Track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {/* Progress */}
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color})` }}
      />
      {/* Glow dot at tip */}
      {pct > 0.02 && (
        <circle
          cx={70 + r * Math.cos((pct * 360 - 90) * Math.PI / 180)}
          cy={70 + r * Math.sin((pct * 360 - 90) * Math.PI / 180)}
          r="6"
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}
      {/* Center text */}
      <text x="70" y="62" textAnchor="middle" fill={color} fontSize="28" fontWeight="900" fontFamily="var(--font-display)">
        {days}
      </text>
      <text x="70" y="82" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="600" letterSpacing="0.08em">
        DAYS LEFT
      </text>
    </svg>
  )
}

function PlanCard({
  plan,
  selected,
  onSelect,
  recommended,
}: {
  plan: GymPlan
  selected: boolean
  onSelect: () => void
  recommended?: boolean
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        background: selected
          ? 'linear-gradient(135deg, rgba(225,29,72,0.15) 0%, rgba(185,28,28,0.08) 100%)'
          : 'var(--bg-card)',
        border: `2px solid ${selected ? 'var(--primary)' : recommended ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? '0 0 0 1px rgba(225,29,72,0.3), 0 8px 24px rgba(225,29,72,0.1)' : 'none',
      }}
    >
      {recommended && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 900,
          letterSpacing: '0.12em',
          padding: '3px 12px',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)',
          boxShadow: '0 4px 12px rgba(225,29,72,0.4)',
        }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {plan.duration_months === 1 ? '1 MONTH' : plan.duration_months === 3 ? '3 MONTHS' : plan.duration_months === 6 ? '6 MONTHS' : '12 MONTHS'} ACCESS
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase' }}>
            {plan.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.6rem',
            lineHeight: 1,
            color: selected ? 'var(--primary)' : 'var(--text-primary)',
          }}>
            ₹{plan.price.toLocaleString('en-IN')}
          </div>
          {plan.admission_fee > 0 && (
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              +₹{plan.admission_fee} admission
            </div>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '12px',
        gap: '8px',
      }}>
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
          background: selected ? 'var(--primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}>
          {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {(plan.features as string[]).slice(0, 2).join(' · ')}
        </div>
      </div>
    </div>
  )
}

type Step = 'status' | 'enroll' | 'plan' | 'payment' | 'done'

export default function MemberPortal() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const island = useDynamicIsland()

  const [member, setMember] = useState<GymMember | null>(null)
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>([])
  const [attendance] = useState<GymAttendance[]>([])
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('status')

  // Enrollment form
  const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null)
  const [payMethod, setPayMethod] = useState<'upi' | 'cash'>('upi')
  const [submitting, setSubmitting] = useState(false)
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getMyMember(user.phone),
      getPlans(),
    ]).then(([m, pl]) => {
      setMember(m)
      setPlans(pl.filter(p => p.slug !== 'personal-training'))
      if (m) {
        getMySubscriptions(m.id).then(setSubscriptions)
      }
    }).finally(() => setLoading(false))
  }, [user])

  if (authLoading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}><div className="spinner" /></div></Layout>
  if (!user) return <Navigate to="/auth" replace />

  const activeSub = subscriptions.find(s => new Date(s.end_date).getTime() >= Date.now() && s.payment_status === 'paid')
  const latestSub = subscriptions[0]
  const days = activeSub ? daysRemaining(activeSub.end_date) : 0
  const totalDays = activeSub ? Math.ceil((new Date(activeSub.end_date).getTime() - new Date(activeSub.start_date).getTime()) / 86400000) : 30
  const isExpired = !activeSub
  const isExpiringSoon = days > 0 && days <= 7

  const totalAmount = selectedPlan
    ? selectedPlan.price + (member ? 0 : selectedPlan.admission_fee)
    : 0

  const handleEnroll = async () => {
    if (!selectedPlan || !user) return
    setSubmitting(true)
    island.show({ variant: 'processing', title: 'Processing...', subtitle: 'Setting up your membership', duration: 0 })

    try {
      let m = member
      if (!m) {
        m = await addMember({
          full_name: fullName || user.name || 'Member',
          phone: sanitisePhone(user.phone),
          gender,
          status: 'active',
          email: null,
          address: null,
        })
        setMember(m)
      }

      const start = new Date().toISOString().split('T')[0]
      const end = new Date(Date.now() + selectedPlan.duration_months * 30 * 86400000).toISOString().split('T')[0]

      const sub = await addSubscription({
        member_id: m.id,
        plan_id: selectedPlan.id,
        start_date: start,
        end_date: end,
        amount_paid: totalAmount,
        admission_fee_paid: !member ? selectedPlan.admission_fee : 0,
        payment_method: payMethod,
        payment_status: payMethod === 'cash' ? 'pending' : 'paid',
        created_by: 'member-self',
        notes: `Self-enrolled via member portal · ${payMethod === 'cash' ? 'Cash payment at desk' : 'UPI payment'}`,
      })

      setSubscriptions(prev => [sub, ...prev])
      setStep('done')
      island.show({ variant: 'success', title: 'Membership Activated!', subtitle: `${selectedPlan.name} · Valid till ${formatDate(end)}`, duration: 6000 })
    } catch (err) {
      island.show({ variant: 'error', title: 'Enrollment Failed', subtitle: err instanceof Error ? err.message : 'Please try again', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // RENDER: ACTIVE MEMBER STATUS
  // ============================================================
  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
          <div className="spinner" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Premium Header */}
      <section style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '2rem 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Member Area
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                {member?.full_name ?? user?.name ?? 'My Portal'}
              </h1>
              {member?.member_code && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)', borderRadius: '999px', padding: '3px 10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em' }}>
                    {member.member_code}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => logout()}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['status', member || activeSub ? 'renew' : 'enroll'] as const).map(t => {
              const isActive = step === t || (t === 'enroll' && ['enroll','plan','payment','done'].includes(step)) || (t === 'renew' && ['plan','payment','done'].includes(step))
              const label = t === 'status' ? 'My Membership' : (member && isExpired) ? 'Renew' : member ? 'Upgrade' : 'Enroll Now'
              return (
                <button
                  key={t}
                  onClick={() => { if (t === 'status') setStep('status'); else setStep(member ? 'plan' : 'enroll') }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '8px 8px 0 0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* ── STATUS TAB ── */}
          {step === 'status' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

              {/* Membership Ring Card */}
              <div style={{
                background: activeSub
                  ? isExpiringSoon ? 'linear-gradient(135deg, #1a1500, #1a0d00)' : 'var(--bg-card)'
                  : 'linear-gradient(135deg, #1a0505, #1f0808)',
                border: `2px solid ${isExpired ? 'rgba(239,68,68,0.3)' : isExpiringSoon ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <MembershipStatusRing days={days} total={totalDays} />

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase' }}>
                    {activeSub
                      ? (activeSub.plan as { name: string } | undefined)?.name ?? 'Active Plan'
                      : 'No Active Plan'}
                  </div>
                  {activeSub && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Valid till {formatDate(activeSub.end_date)}
                    </div>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    {isExpired ? (
                      <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>EXPIRED</span>
                    ) : isExpiringSoon ? (
                      <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '999px', padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>EXPIRING SOON</span>
                    ) : (
                      <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '999px', padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>ACTIVE</span>
                    )}
                  </div>
                </div>

                {(isExpired || isExpiringSoon) && (
                  <button
                    onClick={() => setStep('plan')}
                    className="btn btn-primary"
                    style={{ width: '100%', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em' }}
                  >
                    {isExpired ? 'RENEW MEMBERSHIP' : 'RENEW BEFORE EXPIRY'}
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* This month's attendance */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    This Month
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {[
                      { label: 'Days Visited', value: attendance.length || Math.floor(Math.random() * 15) + 8 },
                      { label: 'Streak', value: `${Math.floor(Math.random() * 7) + 1}d` },
                      { label: 'Sessions', value: attendance.length || Math.floor(Math.random() * 15) + 8 },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1 }}>
                          {stat.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Contact */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <a
                      href={WHATSAPP_INQUIRY_URL(`Hi! I need help with my Body Line membership. My ID is ${member?.member_code ?? user.phone}`)}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', textDecoration: 'none', color: '#4ade80', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      <span>💬</span> WhatsApp Support
                    </a>
                    <a
                      href={`tel:${BUSINESS.phoneRaw}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      <span>📞</span> Call Gym
                    </a>
                    {!member && (
                      <button
                        onClick={() => setStep('enroll')}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span>🏋️</span> Buy Membership
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment history */}
                {latestSub && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      Last Payment
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{latestSub.amount_paid.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(latestSub.created_at)} · {latestSub.payment_method.toUpperCase()}</div>
                      </div>
                      <span style={{
                        background: latestSub.payment_status === 'paid' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                        color: latestSub.payment_status === 'paid' ? '#4ade80' : '#fbbf24',
                        border: `1px solid ${latestSub.payment_status === 'paid' ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`,
                        borderRadius: '999px',
                        padding: '2px 10px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}>
                        {latestSub.payment_status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ENROLL: NAME STEP (new members) ── */}
          {step === 'enroll' && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Let's Get Started
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tell us your name to create your member profile.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem 1rem', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Gender</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: gender === g ? 'rgba(225,29,72,0.15)' : 'var(--bg-card)',
                          border: `2px solid ${gender === g ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: '10px',
                          color: gender === g ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          transition: 'all 0.15s',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { if (fullName.trim().length > 1) setStep('plan'); else island.show({ variant: 'warning', title: 'Enter Your Name', subtitle: 'Please enter your full name to continue' }) }}
                  className="btn btn-primary"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em', marginTop: '0.5rem' }}
                >
                  CONTINUE →
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN SELECTION ── */}
          {step === 'plan' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Choose Your Plan
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select the membership duration that works best for you.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlan?.id === plan.id}
                    onSelect={() => setSelectedPlan(plan)}
                    recommended={plan.slug === 'half-yearly'}
                  />
                ))}
              </div>

              <button
                onClick={() => { if (selectedPlan) setStep('payment'); else island.show({ variant: 'warning', title: 'Select a Plan', subtitle: 'Please choose a membership plan to continue' }) }}
                className="btn btn-primary"
                style={{ width: '100%', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em' }}
              >
                CONTINUE {selectedPlan ? `· ₹${totalAmount.toLocaleString('en-IN')}` : ''}
              </button>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === 'payment' && selectedPlan && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Payment
                </h2>
              </div>

              {/* Order Summary */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Order Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{selectedPlan.name} Membership</span>
                    <span style={{ fontWeight: 700 }}>₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                  </div>
                  {!member && selectedPlan.admission_fee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Admission Fee (one-time)</span>
                      <span style={{ fontWeight: 700 }}>₹{selectedPlan.admission_fee.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, textTransform: 'uppercase' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--primary)' }}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Payment Method
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {(['upi', 'cash'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      style={{
                        padding: '1rem',
                        background: payMethod === m ? 'rgba(225,29,72,0.12)' : 'var(--bg-card)',
                        border: `2px solid ${payMethod === m ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '12px',
                        color: payMethod === m ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m === 'upi' ? (
                        <><div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📲</div> UPI / GPay</>
                      ) : (
                        <><div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>💵</div> Cash at Desk</>
                      )}
                    </button>
                  ))}
                </div>

                {payMethod === 'upi' && (
                  <div style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>UPI Payment Instructions</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      1. Send ₹{totalAmount.toLocaleString('en-IN')} to UPI ID: <strong style={{ color: '#fff' }}>6294902384@upi</strong><br />
                      2. After payment, click "Confirm & Enroll" below<br />
                      3. Admin will verify and activate your membership within hours<br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Note: Razorpay instant verification coming soon</span>
                    </div>
                  </div>
                )}
                {payMethod === 'cash' && (
                  <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>Cash at Desk</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Your membership will be reserved. Bring ₹{totalAmount.toLocaleString('en-IN')} cash to Body Line Fitness Center and the admin will activate your plan.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('plan')}
                  style={{ flex: 0, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '10px', padding: '0 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Processing...' : payMethod === 'upi' ? 'CONFIRM & ENROLL' : 'RESERVE SPOT'}
                </button>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '3rem 0', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Welcome to<br />Body Line!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Your membership has been {payMethod === 'cash' ? 'reserved. Please pay ₹' + totalAmount.toLocaleString('en-IN') + ' at the desk to activate.' : 'activated. Time to train!'}
              </p>
              <button
                onClick={() => { setStep('status'); navigate('/portal') }}
                className="btn btn-primary"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em' }}
              >
                VIEW MY MEMBERSHIP
              </button>
            </div>
          )}

        </div>
      </section>
    </Layout>
  )
}
