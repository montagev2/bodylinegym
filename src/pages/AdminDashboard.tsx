import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useDynamicIsland } from '../components/DynamicIsland'
import {
  getAllMembers, getAllSubscriptions, getExpiringSubscriptions,
  getAllInquiries, addMember, addSubscription, updateInquiryStatus,
  getPlans, getTodayRevenue, updateMemberStatus, updateSubscriptionPayment,
  markAttendance,
} from '../lib/api'
import { WHATSAPP_INQUIRY_URL } from '../lib/business'
import type { GymMember, GymSubscription, GymInquiry, GymPlan } from '../types'

type AdminTab = 'overview' | 'members' | 'subscriptions' | 'inquiries' | 'checkin' | 'add-member'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
}
function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Stat Card
function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color?: string; icon: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${color ?? 'rgba(255,255,255,0.08)'}18`,
        border: `1px solid ${color ?? 'var(--border)'}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1, color: color ?? 'var(--text-primary)' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Member Row
function MemberRow({ member, onWhatsApp, onActivate, onSuspend, onCheckin }: {
  member: GymMember
  onWhatsApp: (m: GymMember) => void
  onActivate: (m: GymMember) => void
  onSuspend: (m: GymMember) => void
  onCheckin: (m: GymMember) => void
}) {
  const initials = member.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.9rem 1.25rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      flexWrap: 'wrap',
    }}>
      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary) 0%, #9f1239 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: '#fff',
      }}>{initials}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '150px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.full_name}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {member.member_code} · {member.phone}
        </div>
      </div>

      {/* Status badge */}
      <span style={{
        padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700,
        background: member.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
        color: member.status === 'active' ? '#4ade80' : '#ef4444',
        border: `1px solid ${member.status === 'active' ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
        textTransform: 'uppercase',
      }}>
        {member.status}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onCheckin(member)}
          title="Mark check-in"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
        >✓ Check-in</button>
        <button
          onClick={() => onWhatsApp(member)}
          title="Send WhatsApp"
          style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
        >💬</button>
        {member.status === 'active' ? (
          <button
            onClick={() => onSuspend(member)}
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
          >Suspend</button>
        ) : (
          <button
            onClick={() => onActivate(member)}
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
          >Activate</button>
        )}
      </div>
    </div>
  )
}

// ── Expiry Alert Row
function ExpiryRow({ sub, onRenew, onRemind }: { sub: GymSubscription; onRenew: (s: GymSubscription) => void; onRemind: (s: GymSubscription) => void }) {
  const days = daysLeft(sub.end_date)
  const urgent = days <= 3
  const member = sub.member as GymMember | undefined
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      padding: '0.85rem 1.25rem',
      background: urgent ? 'linear-gradient(135deg, rgba(28,6,6,0.6), rgba(20,4,4,0.6))' : 'var(--bg-card)',
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.2)'}`,
      borderRadius: '12px',
    }}>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{member?.full_name ?? sub.member_id}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{member?.phone} · Expires {formatDate(sub.end_date)}</div>
      </div>
      <span style={{
        padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700,
        background: urgent ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
        color: urgent ? '#ef4444' : '#fbbf24',
        border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`,
        whiteSpace: 'nowrap',
      }}>{days <= 0 ? 'EXPIRED' : `${days}d left`}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onRemind(sub)} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
          💬 Remind
        </button>
        <button onClick={() => onRenew(sub)} style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)', color: 'var(--primary)', borderRadius: '8px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
          Renew
        </button>
      </div>
    </div>
  )
}

// ── Quick Check-in Tab
function CheckInTab({ members, onCheckin }: { members: GymMember[]; onCheckin: (m: GymMember) => void }) {
  const [q, setQ] = useState('')
  const filtered = q.length >= 2
    ? members.filter(m =>
        m.full_name.toLowerCase().includes(q.toLowerCase()) ||
        m.phone.endsWith(q) ||
        (m.member_code ?? '').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5)
    : []

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏋️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Quick Check-In</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Search member by name, phone, or ID</p>
      </div>

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Name, phone last 4 digits, or BL-001..."
        autoFocus
        style={{
          width: '100%', background: 'var(--bg-card)', border: '2px solid var(--primary)',
          borderRadius: '14px', padding: '1rem 1.25rem', color: 'var(--text-primary)',
          fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
          boxShadow: '0 0 0 4px rgba(225,29,72,0.1)',
        }}
      />

      {filtered.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(m => (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '0.9rem 1.25rem', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => { onCheckin(m); setQ('') }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #9f1239)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: '#fff', flexShrink: 0,
              }}>
                {m.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.full_name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.member_code} · {m.phone}</div>
              </div>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.8rem' }}>Tap to check in →</div>
            </div>
          ))}
        </div>
      )}

      {q.length >= 2 && filtered.length === 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          No member found for "{q}"
        </div>
      )}
    </div>
  )
}

// ── Renew Modal
function RenewModal({ sub, plans, onClose, onDone }: {
  sub: GymSubscription | null
  plans: GymPlan[]
  onClose: () => void
  onDone: (renewed: GymSubscription) => void
}) {
  const island = useDynamicIsland()
  const [planId, setPlanId] = useState(sub?.plan_id ?? '')
  const [payMethod, setPayMethod] = useState<'cash' | 'upi'>('cash')
  const [submitting, setSubmitting] = useState(false)
  const member = sub?.member as GymMember | undefined

  if (!sub) return null

  const selectedPlan = plans.find(p => p.id === planId)
  const prevEnd = new Date(sub.end_date)
  const startDate = prevEnd > new Date() ? prevEnd : new Date()
  const endDate = selectedPlan
    ? new Date(startDate.getTime() + selectedPlan.duration_months * 30 * 86400000)
    : null

  const handleRenew = async () => {
    if (!selectedPlan || !sub.member_id) return
    setSubmitting(true)
    island.show({ variant: 'processing', title: 'Renewing...', duration: 0 })
    try {
      const renewed = await addSubscription({
        member_id: sub.member_id,
        plan_id: selectedPlan.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate!.toISOString().split('T')[0],
        amount_paid: selectedPlan.price,
        payment_method: payMethod,
        payment_status: payMethod === 'cash' ? 'pending' : 'paid',
        renewed_from: sub.id,
        notes: `Renewed by Admin · ${payMethod}`,
        created_by: 'Admin',
      })
      onDone(renewed)
      island.show({ variant: 'success', title: 'Membership Renewed!', subtitle: `${member?.full_name} · Valid till ${endDate!.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, duration: 5000 })
    } catch {
      island.show({ variant: 'error', title: 'Renewal Failed', subtitle: 'Please try again', duration: 3000 })
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px 24px 0 0',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'var(--border)', borderRadius: '999px', margin: '0 auto 1.5rem' }} />

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Renewing for</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase' }}>
            {member?.full_name ?? 'Member'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member?.phone} · {member?.member_code}</div>
        </div>

        {/* Plan picker */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Select Plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {plans.filter(p => p.slug !== 'personal-training').map(p => (
              <label key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: planId === p.id ? 'rgba(225,29,72,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${planId === p.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '10px', padding: '0.75rem 1rem', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="radio" checked={planId === p.id} onChange={() => setPlanId(p.id)} style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: planId === p.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {(['cash', 'upi'] as const).map(m => (
              <button key={m} onClick={() => setPayMethod(m)} style={{
                padding: '0.75rem', background: payMethod === m ? 'rgba(225,29,72,0.12)' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${payMethod === m ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '10px', color: payMethod === m ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center',
              }}>
                {m === 'cash' ? '💵 Cash' : '📲 UPI'}
              </button>
            ))}
          </div>
        </div>

        {endDate && (
          <div style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#4ade80', fontWeight: 600 }}>
            New validity: {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}

        <button
          onClick={handleRenew}
          disabled={!selectedPlan || submitting}
          className="btn btn-primary"
          style={{ width: '100%', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em', opacity: submitting || !selectedPlan ? 0.6 : 1 }}
        >
          {submitting ? 'Processing...' : `CONFIRM RENEWAL${selectedPlan ? ` · ₹${selectedPlan.price.toLocaleString('en-IN')}` : ''}`}
        </button>

        <button onClick={onClose} style={{ display: 'block', width: '100%', marginTop: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const { user, isAdmin, logout, loading: authLoading } = useAuth()
  const island = useDynamicIsland()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [members, setMembers] = useState<GymMember[]>([])
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>([])
  const [expiring, setExpiring] = useState<GymSubscription[]>([])
  const [inquiries, setInquiries] = useState<GymInquiry[]>([])
  const [plans, setPlans] = useState<GymPlan[]>([])
  const [todayRevenue, setTodayRevenue] = useState({ cash: 0, upi: 0, total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [renewTarget, setRenewTarget] = useState<GymSubscription | null>(null)

  // Add member form
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
      getTodayRevenue(),
    ]).then(([m, s, ex, inq, pl, rev]) => {
      setMembers(m); setSubscriptions(s); setExpiring(ex)
      setInquiries(inq); setPlans(pl); setTodayRevenue(rev)
    }).finally(() => setLoading(false))
  }, [user, isAdmin])

  if (authLoading) return <Layout><div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}><div className="spinner" /></div></Layout>
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/portal" replace />

  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) ||
    (m.member_code ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    setAddError(''); setAddLoading(true)
    try {
      const member = await addMember({
        full_name: newMember.full_name, phone: newMember.phone,
        email: newMember.email || null, gender: newMember.gender as GymMember['gender'],
        address: newMember.address || null, status: 'active',
      })
      if (newMember.plan_id) {
        const plan = plans.find(p => p.id === newMember.plan_id)
        if (plan) {
          const startDate = new Date().toISOString().split('T')[0]
          const endDate = new Date(Date.now() + plan.duration_months * 30 * 86400000).toISOString().split('T')[0]
          await addSubscription({
            member_id: member.id, plan_id: plan.id, start_date: startDate,
            end_date: endDate, amount_paid: plan.price,
            payment_method: newMember.payment_method as GymSubscription['payment_method'],
            payment_status: 'paid', created_by: 'Admin',
          })
        }
      }
      island.show({ variant: 'success', title: 'Member Added!', subtitle: `${newMember.full_name} enrolled successfully`, duration: 5000 })
      setAddSuccess(true)
      setNewMember({ full_name: '', phone: '', email: '', gender: 'male', address: '', plan_id: '', payment_method: 'cash' })
      getAllMembers().then(setMembers)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add member')
      island.show({ variant: 'error', title: 'Failed', subtitle: err instanceof Error ? err.message : 'Could not add member', duration: 4000 })
    } finally {
      setAddLoading(false)
    }
  }

  const handleWhatsApp = (m: GymMember) => {
    const sub = subscriptions.find(s => s.member_id === m.id)
    const daysRemain = sub ? daysLeft(sub.end_date) : 0
    const msg = sub && daysRemain > 0
      ? `Hi ${m.full_name}! 👋 Your Body Line Fitness Center membership expires in ${daysRemain} day${daysRemain !== 1 ? 's' : ''} on ${formatDate(sub.end_date)}. Renew today to keep your streak going! 💪 Pay via UPI: 6294902384@upi or at the desk.`
      : `Hi ${m.full_name}! 👋 This is Body Line Fitness Center, Nandakumar. We'd love to have you back! Membership starts from ₹600/month. Visit us or reply here.`
    window.open(WHATSAPP_INQUIRY_URL(msg).replace('https://wa.me/916294902384?text=', `https://wa.me/${m.phone}?text=`), '_blank')
  }

  const handleCheckin = async (m: GymMember) => {
    await markAttendance(m.id, 'manual')
    island.show({ variant: 'success', title: 'Checked In ✓', subtitle: `${m.full_name} · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`, duration: 3500 })
  }

  const handleMemberStatus = async (m: GymMember, status: GymMember['status']) => {
    await updateMemberStatus(m.id, status)
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status } : x))
    island.show({ variant: status === 'active' ? 'success' : 'warning', title: `Member ${status === 'active' ? 'Activated' : 'Suspended'}`, subtitle: m.full_name, duration: 3000 })
  }

  const handleApprovePayment = async (sub: GymSubscription) => {
    await updateSubscriptionPayment(sub.id, 'paid')
    setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, payment_status: 'paid' } : s))
    island.show({ variant: 'success', title: 'Payment Approved', subtitle: `₹${sub.amount_paid} confirmed`, duration: 3000 })
  }

  const handleUpdateInquiry = async (id: string, status: GymInquiry['status']) => {
    await updateInquiryStatus(id, status)
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))
  }

  const TABS: { key: AdminTab; label: string; count?: number; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'members', label: 'Members', icon: '👥', count: members.length },
    { key: 'subscriptions', label: 'Expiring', icon: '⏰', count: expiring.length },
    { key: 'inquiries', label: 'Leads', icon: '📥', count: inquiries.filter(i => i.status === 'new').length },
    { key: 'checkin', label: 'Check-In', icon: '✓' },
    { key: 'add-member', label: 'Add Member', icon: '+' },
  ]

  const activeSubs = subscriptions.filter(s => daysLeft(s.end_date) > 0)
  const pendingPayments = subscriptions.filter(s => s.payment_status === 'pending')

  return (
    <Layout>
      {/* Renew Modal */}
      {renewTarget && (
        <RenewModal
          sub={renewTarget}
          plans={plans}
          onClose={() => setRenewTarget(null)}
          onDone={renewed => {
            setSubscriptions(prev => [renewed, ...prev])
            setExpiring(prev => prev.filter(s => s.id !== renewTarget.id))
            setRenewTarget(null)
          }}
        />
      )}

      {/* Admin Master Control Bar */}
      <section style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '1.75rem 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
                color: '#0c0b0a', fontWeight: 900, padding: '0.3rem 0.75rem',
                borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
              }}>ADMIN</div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
                  Master Control
                </h1>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Body Line Fitness Center</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>{user?.name ?? user?.phone}</span>
              <Link to="/" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                Website
              </Link>
              <button
                onClick={() => logout()}
                style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', color: '#ef4444', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >Logout</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.2rem', overflowX: 'auto', paddingBottom: '1px' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '0.65rem 1rem',
                background: tab === t.key ? 'var(--primary)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: '8px 8px 0 0',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <span>{t.icon}</span>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span style={{ padding: '1px 6px', borderRadius: '999px', background: tab === t.key ? 'rgba(255,255,255,0.3)' : 'var(--primary)', color: '#fff', fontSize: '0.65rem' }}>
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
              {/* ── OVERVIEW ── */}
              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <StatCard label="Total Members" value={members.length} icon="👥" />
                    <StatCard label="Active Subs" value={activeSubs.length} icon="✅" color="#4ade80" />
                    <StatCard label="Expiring Soon" value={expiring.length} icon="⏰" color="#fbbf24" sub="Within 7 days" />
                    <StatCard label="New Leads" value={inquiries.filter(i => i.status === 'new').length} icon="📥" color="#60a5fa" />
                    <StatCard label="Today's Revenue" value={`₹${todayRevenue.total.toLocaleString('en-IN')}`} icon="💰" color="#4ade80" sub={`${todayRevenue.count} payment${todayRevenue.count !== 1 ? 's' : ''} · Cash ₹${todayRevenue.cash.toLocaleString('en-IN')} · UPI ₹${todayRevenue.upi.toLocaleString('en-IN')}`} />
                    <StatCard label="Pending Payments" value={pendingPayments.length} icon="⏳" color="#fbbf24" sub="Needs confirmation" />
                  </div>

                  {/* Expiring alerts */}
                  {expiring.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        ⚠️ Expiring This Week — Act Now
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {expiring.map(s => (
                          <ExpiryRow key={s.id} sub={s}
                            onRenew={s => setRenewTarget(s)}
                            onRemind={s => {
                              const member = s.member as GymMember | undefined
                              if (member) handleWhatsApp(member)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending payments */}
                  {pendingPayments.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        💵 Pending Cash Payments
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {pendingPayments.map(s => {
                          const m = s.member as GymMember | undefined
                          return (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.85rem 1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                              <div style={{ flex: 1, minWidth: '140px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m?.full_name ?? s.member_id}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹{s.amount_paid} · {s.payment_method.toUpperCase()} · {relativeTime(s.created_at)}</div>
                              </div>
                              <button
                                onClick={() => handleApprovePayment(s)}
                                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✓ Approve
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Daily WhatsApp Report */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>📊 Send Daily Report</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                      Send today's gym summary to your WhatsApp — Active: {activeSubs.length} · Expiring: {expiring.length} · Revenue: ₹{todayRevenue.total.toLocaleString('en-IN')}
                    </p>
                    <a
                      href={WHATSAPP_INQUIRY_URL(
                        `📊 *Body Line Fitness Center - Daily Report*\n📅 ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n\n👥 Total Members: ${members.length}\n✅ Active Subscriptions: ${activeSubs.length}\n⏰ Expiring This Week: ${expiring.length}\n📥 New Leads: ${inquiries.filter(i => i.status === 'new').length}\n💰 Today's Revenue: ₹${todayRevenue.total.toLocaleString('en-IN')} (Cash: ₹${todayRevenue.cash.toLocaleString('en-IN')} | UPI: ₹${todayRevenue.upi.toLocaleString('en-IN')})\n⏳ Pending Payments: ${pendingPayments.length}\n\nPowered by Body Line Management`
                      )}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em' }}
                    >
                      💬 SEND TO MY WHATSAPP
                    </a>
                  </div>
                </div>
              )}

              {/* ── MEMBERS ── */}
              {tab === 'members' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or ID..."
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Showing {filteredMembers.length} of {members.length} members
                  </div>
                  {filteredMembers.map(m => (
                    <MemberRow key={m.id} member={m}
                      onWhatsApp={handleWhatsApp}
                      onCheckin={handleCheckin}
                      onActivate={m => handleMemberStatus(m, 'active')}
                      onSuspend={m => handleMemberStatus(m, 'suspended')}
                    />
                  ))}
                  {filteredMembers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      No members found
                    </div>
                  )}
                </div>
              )}

              {/* ── SUBSCRIPTIONS / EXPIRING ── */}
              {tab === 'subscriptions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <StatCard label="Expiring ≤7d" value={expiring.length} icon="⏰" color="#fbbf24" />
                    <StatCard label="Expiring ≤3d" value={expiring.filter(s => daysLeft(s.end_date) <= 3).length} icon="🔴" color="#ef4444" />
                    <StatCard label="Total Active" value={activeSubs.length} icon="✅" color="#4ade80" />
                  </div>
                  {expiring.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      🎉 No expiring memberships this week!
                    </div>
                  ) : (
                    expiring.map(s => (
                      <ExpiryRow key={s.id} sub={s}
                        onRenew={s => setRenewTarget(s)}
                        onRemind={s => {
                          const member = s.member as GymMember | undefined
                          if (member) handleWhatsApp(member)
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {/* ── INQUIRIES / LEADS ── */}
              {tab === 'inquiries' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {inquiries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      No leads yet. Contact form submissions will appear here.
                    </div>
                  ) : (
                    inquiries.map(inq => {
                      const statusColors: Record<string, string> = { new: '#60a5fa', contacted: '#fbbf24', converted: '#4ade80', closed: 'var(--text-muted)' }
                      return (
                        <div key={inq.id} style={{ background: 'var(--bg-card)', border: `1px solid ${inq.status === 'new' ? 'rgba(96,165,250,0.3)' : 'var(--border)'}`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inq.full_name}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{inq.phone}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: statusColors[inq.status], background: `${statusColors[inq.status]}18`, border: `1px solid ${statusColors[inq.status]}30`, borderRadius: '999px', padding: '2px 8px', textTransform: 'uppercase' }}>
                                {inq.status}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{relativeTime(inq.created_at)}</span>
                            </div>
                          </div>
                          {inq.message && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{inq.message}</div>}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <a
                              href={`https://wa.me/${inq.phone}?text=${encodeURIComponent(`Hi ${inq.full_name}! 👋 This is Body Line Fitness Center, Nandakumar. Thanks for your interest! How can I help you?`)}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >💬 WhatsApp</a>
                            {inq.status === 'new' && (
                              <button onClick={() => handleUpdateInquiry(inq.id, 'contacted')} style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark Contacted</button>
                            )}
                            {inq.status === 'contacted' && (
                              <button onClick={() => handleUpdateInquiry(inq.id, 'converted')} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark Converted</button>
                            )}
                            {inq.status !== 'closed' && inq.status !== 'converted' && (
                              <button onClick={() => handleUpdateInquiry(inq.id, 'closed')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* ── CHECK-IN ── */}
              {tab === 'checkin' && (
                <CheckInTab members={members} onCheckin={handleCheckin} />
              )}

              {/* ── ADD MEMBER ── */}
              {tab === 'add-member' && (
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Enroll New Member</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Fill in the member's details and assign a plan.</p>
                  </div>

                  {addSuccess && (
                    <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>✅</span>
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.88rem' }}>Member enrolled successfully! You can add another one below.</span>
                    </div>
                  )}
                  {addError && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                      {addError}
                    </div>
                  )}

                  <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { id: 'full_name', label: 'Full Name *', placeholder: 'Member full name', type: 'text', required: true },
                      { id: 'phone', label: 'Phone Number *', placeholder: '10-digit mobile number', type: 'tel', required: true },
                      { id: 'email', label: 'Email (optional)', placeholder: 'email@example.com', type: 'email', required: false },
                      { id: 'address', label: 'Address (optional)', placeholder: 'Near Basudevpur...', type: 'text', required: false },
                    ].map(field => (
                      <div key={field.id}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>{field.label}</label>
                        <input
                          type={field.type}
                          required={field.required}
                          placeholder={field.placeholder}
                          value={(newMember as Record<string, string>)[field.id]}
                          onChange={e => setNewMember(prev => ({ ...prev, [field.id]: e.target.value }))}
                          style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Gender</label>
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        {(['male', 'female', 'other'] as const).map(g => (
                          <button key={g} type="button" onClick={() => setNewMember(p => ({ ...p, gender: g }))} style={{ flex: 1, padding: '0.65rem', background: newMember.gender === g ? 'rgba(225,29,72,0.12)' : 'var(--bg-card)', border: `2px solid ${newMember.gender === g ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', color: newMember.gender === g ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Assign Plan (optional)</label>
                      <select
                        value={newMember.plan_id}
                        onChange={e => setNewMember(p => ({ ...p, plan_id: e.target.value }))}
                        style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">No plan (walk-in)</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name} · ₹{p.price.toLocaleString('en-IN')}</option>
                        ))}
                      </select>
                    </div>

                    {newMember.plan_id && (
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Payment Method</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                          {(['cash', 'upi', 'card'] as const).map(m => (
                            <button key={m} type="button" onClick={() => setNewMember(p => ({ ...p, payment_method: m }))} style={{ padding: '0.65rem', background: newMember.payment_method === m ? 'rgba(225,29,72,0.12)' : 'var(--bg-card)', border: `2px solid ${newMember.payment_method === m ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', color: newMember.payment_method === m ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={addLoading}
                      className="btn btn-primary"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '0.08em', marginTop: '0.5rem', opacity: addLoading ? 0.7 : 1 }}
                    >
                      {addLoading ? 'Enrolling...' : '+ ENROLL MEMBER'}
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
