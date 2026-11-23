import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMyMember, getMySubscriptions, getMyAttendance } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymMember, GymSubscription, GymAttendance } from '../types'

function daysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((end - now) / 86400000))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function MemberPortal() {
  const { user, logout, loading: authLoading } = useAuth()
  const [member, setMember] = useState<GymMember | null>(null)
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>([])
  const [attendance, setAttendance] = useState<GymAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    getMyMember(user.phone)
      .then(async m => {
        setMember(m)
        if (m) {
          const [subs, att] = await Promise.all([
            getMySubscriptions(m.id),
            getMyAttendance(m.id, 20),
          ])
          setSubscriptions(subs)
          setAttendance(att)
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
          <div className="spinner" />
        </div>
      </Layout>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  const activeSub = subscriptions.find(s => {
    const end = new Date(s.end_date).getTime()
    return end >= Date.now() && s.payment_status === 'paid'
  })

  const days = activeSub ? daysRemaining(activeSub.end_date) : 0
  const isExpiringSoon = days > 0 && days <= 7
  const isExpired = !activeSub

  return (
    <Layout>
      {/* Header */}
      <section style={{
        background: 'var(--bg-main)',
        padding: '3rem 0 2rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label">Member Area</div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                textTransform: 'uppercase',
              }}>
                {member ? member.full_name : 'My Portal'}
              </h1>
              {member?.member_code && (
                <span className="badge badge-red" style={{ marginTop: '0.5rem' }}>
                  ID: {member.member_code}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {member?.status && (
                <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                  {member.status.toUpperCase()}
                </span>
              )}
              <Link to="/" className="btn btn-outline btn-sm">
                Website
              </Link>
              <button
                onClick={() => logout()}
                style={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: 'var(--primary-light)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', color: 'var(--primary-light)', textAlign: 'center' }}>
              {error}
            </div>
          ) : !member ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Account Not Linked
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your phone number is not linked to any gym membership yet.
                Contact us to link your account.
              </p>
              <a
                href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%20want%20to%20link%20my%20account%20to%20the%20Body%20Line%20member%20portal.%20My%20number%20is%20${user.phone ?? ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Contact Gym to Link Account
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Subscription status card */}
                <div style={{
                  background: activeSub
                    ? isExpiringSoon ? 'linear-gradient(135deg, #1a1500, #1a0f00)' : 'var(--bg-card)'
                    : 'linear-gradient(135deg, #1a0505, #1f0808)',
                  border: `2px solid ${isExpired ? 'var(--primary)' : isExpiringSoon ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '2rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        Current Membership
                      </div>
                      <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: '1.75rem',
                        textTransform: 'uppercase',
                        color: isExpired ? 'var(--primary)' : 'var(--text-primary)',
                      }}>
                        {activeSub?.plan
                          ? (activeSub.plan as { name: string }).name
                          : isExpired ? 'No Active Plan' : 'Loading...'}
                      </h2>
                    </div>
                    {isExpired ? (
                      <span className="badge badge-red">Expired</span>
                    ) : isExpiringSoon ? (
                      <span className="badge badge-gold">Expiring Soon</span>
                    ) : (
                      <span className="badge badge-green">Active</span>
                    )}
                  </div>

                  {activeSub && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {[
                          { label: 'Days Left', value: String(days), highlight: isExpiringSoon },
                          { label: 'Start Date', value: formatDate(activeSub.start_date), highlight: false },
                          { label: 'End Date', value: formatDate(activeSub.end_date), highlight: isExpiringSoon },
                        ].map(({ label, value, highlight }) => (
                          <div key={label}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                              {label}
                            </div>
                            <div style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '1.25rem',
                              color: highlight ? 'var(--gold)' : 'var(--text-primary)',
                            }}>
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(isExpiringSoon || isExpired) && (
                        <div style={{ padding: '1rem', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                          <p style={{ color: 'var(--gold-light)', fontSize: '0.875rem' }}>
                            {isExpired
                              ? 'Your membership has expired. Renew now to continue training!'
                              : `Your membership expires in ${days} day${days !== 1 ? 's' : ''}. Time to renew!`}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <a
                    href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%20want%20to%20${isExpired ? 'renew' : 'discuss'}%20my%20membership%20at%20Body%20Line%20Fitness%20Center.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={isExpired ? 'btn btn-primary' : 'btn btn-outline'}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    {isExpired ? 'Renew Membership' : 'Contact to Renew'}
                  </a>
                </div>

                {/* Subscription history */}
                {subscriptions.length > 0 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                      Subscription History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {subscriptions.slice(0, 5).map(sub => (
                        <div key={sub.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          background: 'var(--bg-elevated)',
                          borderRadius: '6px',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {sub.plan ? (sub.plan as { name: string }).name : 'Plan'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {formatDate(sub.start_date)} — {formatDate(sub.end_date)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {sub.amount_paid.toLocaleString('en-IN')}
                            </div>
                            <span className={`badge ${sub.payment_status === 'paid' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                              {sub.payment_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column — attendance */}
              <div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    Recent Attendance
                  </h3>
                  {attendance.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No attendance records yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {attendance.map(att => (
                        <div key={att.id} style={{
                          padding: '0.875rem',
                          background: 'var(--bg-elevated)',
                          borderRadius: '6px',
                          borderLeft: '3px solid var(--primary)',
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                            Check-in
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {formatDateTime(att.check_in_at)}
                          </div>
                          {att.check_out_at && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                              Out: {formatDateTime(att.check_out_at)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/membership" className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>View Plans</Link>
                  <Link to="/schedule" className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>Class Schedule</Link>
                  <Link to="/contact" className="btn btn-outline btn-sm" style={{ textAlign: 'center' }}>Contact Gym</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
