import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDynamicIsland } from './DynamicIsland'
import { addMember, addSubscription, getMyMember } from '../lib/api'
import { sanitisePhone, isValidPhone, isValidPin } from '../lib/security'
import { BUSINESS } from '../lib/business'
import type { GymPlan, GymSubscription } from '../types'

interface CheckoutModalProps {
  plan: GymPlan | null
  onClose: () => void
  onSuccess?: (sub: GymSubscription) => void
}

export default function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const island = useDynamicIsland()

  // Form states for guest checkout
  const [fullName, setFullName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [pin, setPin] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi')
  const [utr, setUtr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!plan) return null

  const isGuest = !user
  const admissionFee = plan.admission_fee || 0
  const totalAmount = plan.price + (isGuest ? admissionFee : 0)

  // Direct UPI Intent URL for mobile apps (PhonePe, GPay, Paytm)
  const upiIntentUrl = `upi://pay?pa=${BUSINESS.phoneRaw}@upi&pn=BodyLineGym&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`BodyLine_${plan.slug}`)}`

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (isGuest) {
      const cleanPhone = sanitisePhone(phone)
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name')
        return
      }
      if (!isValidPhone(cleanPhone)) {
        setErrorMsg('Please enter a valid 10-digit mobile number')
        return
      }
      if (!isValidPin(pin)) {
        setErrorMsg('PIN must be exactly 4 digits for your member login')
        return
      }
    }

    setSubmitting(true)
    island.show({
      variant: 'processing',
      title: 'Activating Membership...',
      subtitle: `Setting up your ${plan.name} access`,
      duration: 0,
    })

    try {
      const cleanPhone = sanitisePhone(user?.phone || phone)
      const memberName = user?.name || fullName

      // 1. If guest, register user account first
      if (isGuest) {
        await register(cleanPhone, pin, memberName)
      }

      // 2. Fetch or create GymMember record
      let member = await getMyMember(cleanPhone)
      if (!member) {
        member = await addMember({
          full_name: memberName,
          phone: cleanPhone,
          gender,
          status: 'active',
          address: 'Nandakumar, West Bengal',
        })
      }

      // 3. Calculate validity dates
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + plan.duration_months * 30 * 86400000).toISOString().split('T')[0]

      // 4. Create subscription in DB
      const sub = await addSubscription({
        member_id: member.id,
        plan_id: plan.id,
        start_date: startDate,
        end_date: endDate,
        amount_paid: totalAmount,
        admission_fee_paid: isGuest ? admissionFee : 0,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        transaction_ref: utr.trim() || (paymentMethod === 'upi' ? `UPI-${Date.now().toString().slice(-6)}` : null),
        notes: `Online checkout · ${paymentMethod === 'cash' ? 'Pay Cash at Desk' : 'UPI Self-Enroll'}`,
        created_by: 'member-web',
      })

      island.show({
        variant: 'success',
        title: '🎉 Membership Confirmed!',
        subtitle: `${plan.name} Plan active till ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        duration: 5000,
      })

      onSuccess?.(sub)
      onClose()
      navigate('/portal')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Subscription failed. Please try again.'
      setErrorMsg(msg)
      island.show({
        variant: 'error',
        title: 'Enrollment Error',
        subtitle: msg,
        duration: 4000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="bottom-sheet"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(225, 29, 72, 0.2)',
          position: 'relative',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(18, 18, 21, 0.9) 100%)',
            borderBottom: '1px solid var(--border)',
            padding: '1.5rem 1.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Direct Gym Membership
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.75rem',
                textTransform: 'uppercase',
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Subscribe to {plan.name}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
              {plan.duration_months === 1 ? '30 Days Access' : `${plan.duration_months} Months Access`} · Body Line Fitness Center
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                color: '#ef4444',
                fontSize: '0.85rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Member Details (shown if guest) */}
          {isGuest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                1. Member Information
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourav Mondal"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Set 4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Gender
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['male', 'female', 'other'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        background: gender === g ? 'rgba(225, 29, 72, 0.15)' : 'var(--bg-card)',
                        border: `1.5px solid ${gender === g ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        color: gender === g ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logged in member badge */}
          {!isGuest && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscribing As</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{user.name || 'Member'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.phone}</div>
              </div>
              <span className="badge badge-green">VERIFIED ACCOUNT</span>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Plan Summary
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{plan.name} Membership ({plan.duration_months} mo)</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>₹{plan.price.toLocaleString('en-IN')}</span>
            </div>

            {isGuest && admissionFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>One-time Admission Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>₹{admissionFee.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem' }}>
                Total Payable
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  color: 'var(--primary)',
                  lineHeight: 1,
                }}
              >
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Payment Method
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  padding: '1rem',
                  background: paymentMethod === 'upi' ? 'rgba(225, 29, 72, 0.12)' : 'var(--bg-card)',
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📲</div>
                Instant UPI / GPay
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{
                  padding: '1rem',
                  background: paymentMethod === 'cash' ? 'rgba(225, 29, 72, 0.12)' : 'var(--bg-card)',
                  border: `2px solid ${paymentMethod === 'cash' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  color: paymentMethod === 'cash' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💵</div>
                Pay Cash at Desk
              </button>
            </div>

            {/* UPI details */}
            {paymentMethod === 'upi' && (
              <div
                style={{
                  background: 'rgba(74, 222, 128, 0.06)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Body Line Official UPI
                  </span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    VERIFIED
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <code style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, letterSpacing: '0.02em' }}>
                    {BUSINESS.phoneRaw}@upi
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${BUSINESS.phoneRaw}@upi`)
                      island.show({ variant: 'info', title: 'UPI ID Copied!', subtitle: `${BUSINESS.phoneRaw}@upi`, duration: 2500 })
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>

                {/* 1-Tap App Payment on phone */}
                <a
                  href={upiIntentUrl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <span>📲</span> Open PhonePe / GPay / Paytm (₹{totalAmount})
                </a>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    UPI Reference / UTR Number (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="12-digit transaction ID"
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cash at desk details */}
            {paymentMethod === 'cash' && (
              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: '#fbbf24' }}>Desk Reservation:</strong> Your membership will be created immediately with pending payment status. You can bring ₹{totalAmount.toLocaleString('en-IN')} cash directly to the Body Line reception desk to activate your physical access.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                flex: 1,
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '0.08em',
                padding: '0.9rem',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting
                ? 'Processing...'
                : paymentMethod === 'upi'
                ? `CONFIRM & PAY ₹${totalAmount.toLocaleString('en-IN')}`
                : `RESERVE MEMBERSHIP (₹${totalAmount.toLocaleString('en-IN')})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
