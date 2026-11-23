import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  getAllMembers,
  getAllSubscriptions,
  getExpiringSubscriptions,
  getAllInquiries,
  addMember,
  addSubscription,
  updateInquiryStatus,
  getPlans,
} from '../lib/api'
import type { GymMember, GymSubscription, GymInquiry, GymPlan } from '../types'

type AdminTab = 'overview' | 'members' | 'subscriptions' | 'inquiries' | 'add-member'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [members, setMembers] = useState<GymMember[]>([])
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>([])
  const [expiring, setExpiring] = useState<GymSubscription[]>([])
  const [inquiries, setInquiries] = useState<GymInquiry[]>([])
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add member form state
  const [newMember, setNewMember] = useState({ full_name: '', phone: '', email: '', gender: 'male', address: '', plan_id: '', payment_method: 'cash' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  useEffect(() => {
    if (!user || !isAdmin) return
    Promise.all([
      getAllMembers(),
      getAllSubscriptions(),
      getExpiringSubscriptions(7),
      getAllInquiries(),
      getPlans(),
    ])
      .then(([m, s, ex, inq, pl]) => {
        setMembers(m)
        setSubscriptions(s)
        setExpiring(ex)
        setInquiries(inq)
        setPlans(pl)
      })
      .finally(() => setLoading(false))
  }, [user, isAdmin])

  if (authLoading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}><div className="spinner" /></div></Layout>
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/portal" replace />

  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  )

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)
    try {
      const member = await addMember({
        full_name: newMember.full_name,
        phone: newMember.phone,
        email: newMember.email || null,
        gender: newMember.gender as GymMember['gender'],
        address: newMember.address || null,
        status: 'active',
      })

      if (newMember.plan_id) {
        const plan = plans.find(p => p.id === newMember.plan_id)
        if (plan) {
          const startDate = new Date().toISOString().split('T')[0]
          const endDate = new Date(Date.now() + plan.duration_months * 30 * 86400000).toISOString().split('T')[0]
          await addSubscription({
            member_id: member.id,
            plan_id: plan.id,
            start_date: startDate,
            end_date: endDate,
            amount_paid: plan.price,
            payment_method: newMember.payment_method as GymSubscription['payment_method'],
            payment_status: 'paid',
          })
        }
      }

      setAddSuccess(true)
      setNewMember({ full_name: '', phone: '', email: '', gender: 'male', address: '', plan_id: '', payment_method: 'cash' })
      // Refresh members list
      getAllMembers().then(setMembers)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setAddLoading(false)
    }
  }

  const handleUpdateInquiry = async (id: string, status: GymInquiry['status']) => {
    await updateInquiryStatus(id, status)
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))
  }

  const TABS: { key: AdminTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members', count: members.length },
    { key: 'subscriptions', label: 'Subscriptions', count: expiring.length },
    { key: 'inquiries', label: 'Inquiries', count: inquiries.filter(i => i.status === 'new').length },
    { key: 'add-member', label: '+ Add Member' },
  ]

  return (
    <Layout>
      {/* Header */}
      <section style={{ background: 'var(--bg-main)', padding: '3rem 0 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">Admin</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 3rem)', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Dashboard
          </h1>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: tab === t.key ? 'var(--primary)' : 'transparent',
                  color: tab === t.key ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid transparent' : '2px solid transparent',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRadius: '6px 6px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span style={{
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    background: tab === t.key ? 'rgba(255,255,255,0.3)' : 'var(--primary)',
                    color: 'white',
                    fontSize: '0.7rem',
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><div className="spinner" /></div>
          ) : (
            <>
              {/* Overview */}
              {tab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                      { label: 'Total Members', value: members.length, color: 'var(--text-primary)' },
                      { label: 'Active Subs', value: subscriptions.filter(s => daysLeft(s.end_date) > 0).length, color: '#4ade80' },
                      { label: 'Expiring (7d)', value: expiring.length, color: 'var(--gold)' },
                      { label: 'New Inquiries', value: inquiries.filter(i => i.status === 'new').length, color: 'var(--primary)' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Expiring soon */}
                  {expiring.length > 0 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem' }}>
                        Expiring Within 7 Days
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {expiring.map(sub => {
                          const member = sub.member as GymMember | undefined
                          const days = daysLeft(sub.end_date)
                          return (
                            <div key={sub.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.875rem 1rem',
                              background: 'var(--bg-elevated)',
                              borderRadius: '6px',
                              borderLeft: `3px solid ${days <= 3 ? 'var(--primary)' : 'var(--gold)'}`,
                              gap: '1rem',
                              flexWrap: 'wrap',
                            }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>{member?.full_name ?? 'Unknown'}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{member?.phone ?? ''}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: days <= 3 ? 'var(--primary)' : 'var(--gold)' }}>
                                  {days}d left
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Expires {formatDate(sub.end_date)}</div>
                              </div>
                              <a
                                href={`https://wa.me/${(member?.phone ?? '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${member?.full_name ?? ''}! Your Body Line Fitness Center membership expires in ${days} days. Would you like to renew?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm"
                              >
                                WhatsApp
                              </a>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Members */}
              {tab === 'members' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Search by name or phone..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                          {['Name', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{m.full_name}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>{m.phone}</td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-red'}`}>{m.status}</span>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(m.created_at)}</td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <a
                                href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(m.full_name)}!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                              >
                                WhatsApp
                              </a>
                            </td>
                          </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inquiries */}
              {tab === 'inquiries' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {inquiries.map(inq => (
                    <div key={inq.id} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${inq.status === 'new' ? 'var(--primary)' : inq.status === 'contacted' ? 'var(--gold)' : 'var(--text-muted)'}`,
                      borderRadius: '8px',
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                      alignItems: 'start',
                    }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700 }}>{inq.full_name}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{inq.phone}</span>
                          <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>{inq.inquiry_type.replace('_', ' ')}</span>
                          <span className={`badge ${inq.status === 'new' ? 'badge-red' : inq.status === 'contacted' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>{inq.status}</span>
                        </div>
                        {inq.message && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inq.message}</p>}
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                          {new Date(inq.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(inq.full_name)}!%20Thanks%20for%20your%20inquiry%20at%20Body%20Line%20Fitness%20Center.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Reply
                        </a>
                        {inq.status === 'new' && (
                          <button onClick={() => handleUpdateInquiry(inq.id, 'contacted')} className="btn btn-outline btn-sm">
                            Mark Contacted
                          </button>
                        )}
                        {inq.status === 'contacted' && (
                          <button onClick={() => handleUpdateInquiry(inq.id, 'converted')} className="btn btn-outline btn-sm">
                            Mark Converted
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No inquiries yet</div>
                  )}
                </div>
              )}

              {/* Subscriptions expiring */}
              {tab === 'subscriptions' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    All Subscriptions (sorted by expiry)
                  </h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                          {['Member', 'Plan', 'Start', 'End', 'Days Left', 'Amount', 'Status'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map(sub => {
                          const member = sub.member as GymMember | undefined
                          const plan = sub.plan as GymPlan | undefined
                          const days = daysLeft(sub.end_date)
                          return (
                            <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)', background: days < 0 ? 'rgba(220,38,38,0.03)' : days <= 7 ? 'rgba(212,160,23,0.03)' : 'transparent' }}>
                              <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{member?.full_name ?? '—'}</td>
                              <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>{plan?.name ?? '—'}</td>
                              <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(sub.start_date)}</td>
                              <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(sub.end_date)}</td>
                              <td style={{ padding: '0.875rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: days < 0 ? 'var(--primary)' : days <= 7 ? 'var(--gold)' : '#4ade80' }}>
                                {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                              </td>
                              <td style={{ padding: '0.875rem 1rem' }}>{sub.amount_paid.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '0.875rem 1rem' }}>
                                <span className={`badge ${sub.payment_status === 'paid' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>{sub.payment_status}</span>
                              </td>
                            </tr>
                          )
                        })}
                        {subscriptions.length === 0 && (
                          <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subscriptions found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add Member */}
              {tab === 'add-member' && (
                <div style={{ maxWidth: '600px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '2rem' }}>
                    Add New Member
                  </h2>
                  {addSuccess && (
                    <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', color: '#4ade80', marginBottom: '1.5rem' }}>
                      Member added successfully!{' '}
                      <button onClick={() => setAddSuccess(false)} style={{ color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        Add another
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { label: 'Full Name *', field: 'full_name', type: 'text', placeholder: 'Member full name', required: true },
                      { label: 'Phone *', field: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true },
                      { label: 'Email', field: 'email', type: 'email', placeholder: 'optional', required: false },
                      { label: 'Address', field: 'address', type: 'text', placeholder: 'optional', required: false },
                    ].map(({ label, field, type, placeholder, required }) => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</label>
                        <input
                          className="input"
                          type={type}
                          value={newMember[field as keyof typeof newMember]}
                          onChange={e => setNewMember(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={placeholder}
                          required={required}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Membership Plan</label>
                      <select
                        className="input"
                        value={newMember.plan_id}
                        onChange={e => setNewMember(prev => ({ ...prev, plan_id: e.target.value }))}
                      >
                        <option value="">-- No plan yet --</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('en-IN')}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Payment Method</label>
                      <select className="input" value={newMember.payment_method} onChange={e => setNewMember(prev => ({ ...prev, payment_method: e.target.value }))}>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {addError && (
                      <div style={{ padding: '0.875rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '6px', color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                        {addError}
                      </div>
                    )}

                    <button type="submit" disabled={addLoading} className="btn btn-primary btn-lg" style={{ opacity: addLoading ? 0.7 : 1 }}>
                      {addLoading ? 'Adding Member...' : 'Add Member'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
