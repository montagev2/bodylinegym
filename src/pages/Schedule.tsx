import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getClassSchedules } from '../lib/api'
import type { GymClassSchedule } from '../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Fallback schedule data
const FALLBACK_SCHEDULES: GymClassSchedule[] = [
  // Morning batch (Mon-Sat)
  ...([1,2,3,4,5,6] as const).map(day => ({
    id: `morning-strength-${day}`,
    class_name: 'Strength Training',
    trainer_id: null,
    day_of_week: day,
    start_time: '05:00',
    end_time: '09:00',
    capacity: 30,
    batch: 'Morning',
    is_active: true,
    created_at: '',
  })),
  // Evening batch (Mon-Sat)
  ...([1,2,3,4,5,6] as const).map(day => ({
    id: `evening-strength-${day}`,
    class_name: 'Strength & Cardio',
    trainer_id: null,
    day_of_week: day,
    start_time: '17:00',
    end_time: '21:00',
    capacity: 30,
    batch: 'Evening',
    is_active: true,
    created_at: '',
  })),
  // Boxing (Mon/Wed/Fri)
  ...([1,3,5] as const).map(day => ({
    id: `boxing-${day}`,
    class_name: 'Boxing & Combat',
    trainer_id: null,
    day_of_week: day,
    start_time: '07:00',
    end_time: '08:30',
    capacity: 15,
    batch: 'Morning',
    is_active: true,
    created_at: '',
  })),
  // Sunday open gym
  {
    id: 'sunday-open',
    class_name: 'Open Gym',
    trainer_id: null,
    day_of_week: 0,
    start_time: '07:00',
    end_time: '12:00',
    capacity: 40,
    batch: 'Morning',
    is_active: true,
    created_at: '',
  },
]

const CLASS_COLORS: Record<string, string> = {
  'Strength Training': 'var(--primary)',
  'Strength & Cardio': '#7c3aed',
  'Boxing & Combat': 'var(--gold)',
  'Open Gym': '#059669',
  'Cardio': '#0ea5e9',
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<GymClassSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(new Date().getDay())

  useEffect(() => {
    getClassSchedules()
      .then(data => setSchedules(data.length > 0 ? data : FALLBACK_SCHEDULES))
      .catch(() => setSchedules(FALLBACK_SCHEDULES))
      .finally(() => setLoading(false))
  }, [])

  const byDay = DAYS.reduce<Record<number, GymClassSchedule[]>>((acc, _, i) => {
    acc[i] = schedules.filter(s => s.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time))
    return acc
  }, {})

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
          <div className="section-label">Timetable</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Class Schedule</h1>
          <p className="section-subtitle">
            Structured sessions for every fitness goal. Morning and evening batches available.
          </p>
        </div>
      </section>

      {/* Open 24hrs banner */}
      <div style={{
        background: 'linear-gradient(90deg, var(--primary), #7f1d1d)',
        padding: '1rem 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'white',
        }}>
          GYM IS OPEN 24/7 — Free-access training available anytime
        </p>
      </div>

      {/* Schedule */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Day tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}>
                {DAYS_SHORT.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(i)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '6px',
                      border: `2px solid ${activeDay === i ? 'var(--primary)' : 'var(--border)'}`,
                      background: activeDay === i ? 'var(--primary)' : 'var(--bg-card)',
                      color: activeDay === i ? 'white' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Selected day classes */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                  color: 'var(--text-primary)',
                }}>
                  {DAYS[activeDay]}
                </h3>

                {byDay[activeDay].length === 0 ? (
                  <div style={{
                    padding: '3rem',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}>
                    <p style={{ marginBottom: '0.5rem' }}>No structured classes scheduled.</p>
                    <p style={{ fontSize: '0.85rem' }}>The gym is still open 24/7 for free training.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {byDay[activeDay].map(cls => {
                      const color = CLASS_COLORS[cls.class_name] ?? 'var(--primary)'
                      return (
                        <div
                          key={cls.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: `1px solid var(--border)`,
                            borderLeft: `4px solid ${color}`,
                            borderRadius: '8px',
                            padding: '1.5rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '1rem',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                              <h4 style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 800,
                                fontSize: '1.15rem',
                                textTransform: 'uppercase',
                                color: 'var(--text-primary)',
                              }}>
                                {cls.class_name}
                              </h4>
                              {cls.batch && (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '4px',
                                  background: `${color}18`,
                                  border: `1px solid ${color}40`,
                                  color,
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                }}>
                                  {cls.batch}
                                </span>
                              )}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              Capacity: up to {cls.capacity} members
                              {cls.trainer && (
                                <span style={{ marginLeft: '1rem' }}>Trainer: {(cls.trainer as { full_name: string }).full_name}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              color: 'var(--text-primary)',
                            }}>
                              {formatTime(cls.start_time)}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              to {formatTime(cls.end_time)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Full week grid */}
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                }}>
                  Full Week Overview
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session</th>
                        {DAYS_SHORT.map(d => (
                          <th key={d} style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Morning (5-9 AM)', 'Boxing (7-8:30 AM)', 'Evening (5-9 PM)'].map((session, si) => (
                        <tr key={session} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{session}</td>
                          {DAYS_SHORT.map((_, di) => {
                            const hasClass = byDay[di].some(c => {
                              if (si === 0) return c.batch === 'Morning' && c.class_name === 'Strength Training'
                              if (si === 1) return c.class_name === 'Boxing & Combat'
                              if (si === 2) return c.batch === 'Evening'
                              return false
                            })
                            return (
                              <td key={di} style={{ padding: '0.75rem', textAlign: 'center' }}>
                                {hasClass ? (
                                  <span style={{ color: '#4ade80', fontSize: '1rem' }}>{'\u2713'}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{'\u2014'}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
