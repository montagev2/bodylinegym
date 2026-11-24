import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getClassSchedules } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymClassSchedule } from '../types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const FALLBACK_SCHEDULES: GymClassSchedule[] = [
  ...([1,2,3,4,5,6] as const).map(day => ({
    id: `morning-strength-${day}`,
    class_name: 'Morning Strength & Weight Training',
    trainer_id: null,
    day_of_week: day,
    start_time: '05:00',
    end_time: '09:30',
    capacity: 35,
    batch: 'Morning Peak',
    is_active: true,
    created_at: '',
  })),
  ...([1,3,5] as const).map(day => ({
    id: `boxing-${day}`,
    class_name: 'Boxing & Strike Conditioning',
    trainer_id: null,
    day_of_week: day,
    start_time: '07:00',
    end_time: '08:30',
    capacity: 15,
    batch: 'Morning Combat',
    is_active: true,
    created_at: '',
  })),
  ...([1,2,3,4,5,6] as const).map(day => ({
    id: `evening-strength-${day}`,
    class_name: 'Evening Hypertrophy & Free Weights',
    trainer_id: null,
    day_of_week: day,
    start_time: '16:30',
    end_time: '21:30',
    capacity: 35,
    batch: 'Evening Peak',
    is_active: true,
    created_at: '',
  })),
  {
    id: 'sunday-open',
    class_name: 'Sunday Open Floor Training',
    trainer_id: null,
    day_of_week: 0,
    start_time: '07:00',
    end_time: '13:00',
    capacity: 40,
    batch: 'Open Hours',
    is_active: true,
    created_at: '',
  },
]

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<GymClassSchedule[]>(FALLBACK_SCHEDULES)
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

  const todaySessions = byDay[activeDay] ?? []

  return (
    <Layout>
      {/* Clean Hero */}
      <section
        style={{
          background: 'linear-gradient(to bottom, #121215, #09090b)',
          padding: '4rem 0 2.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="section-label">Training Hours</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            Schedule &amp; Timings
          </h1>
          <p className="section-subtitle">
            Body Line is open 24 hours. Regular coached batches run every morning and evening with open floor access around the clock.
          </p>
        </div>
      </section>

      {/* Day Selector & Sessions */}
      <section className="section">
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Day Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginBottom: '2rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {DAYS_SHORT.map((dayShort, i) => {
              const isSelected = activeDay === i
              const isToday = new Date().getDay() === i

              return (
                <button
                  key={dayShort}
                  onClick={() => setActiveDay(i)}
                  style={{
                    flex: '1 0 auto',
                    minWidth: '58px',
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{dayShort}</span>
                  {isToday && (
                    <span
                      style={{
                        fontSize: '0.55rem',
                        letterSpacing: '0.05em',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        background: isSelected ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      TODAY
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 24/7 Access Notice Banner */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              background: 'rgba(225, 29, 72, 0.06)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase' }}>
                Open 24 Hours Every Day
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Members have keycard / biometric floor access 24/7, including late nights and early mornings.
              </div>
            </div>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
                "Hi! I want to confirm 24/7 access details for Body Line Fitness Center, Nandakumar."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              Ask on WhatsApp
            </a>
          </div>

          {/* Sessions for the Day */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.6rem',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              {DAYS[activeDay]} Sessions
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                <div className="spinner" />
              </div>
            ) : todaySessions.length === 0 ? (
              <div
                className="card"
                style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}
              >
                Open gym floor active all day. No scheduled group batches.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {todaySessions.map(session => (
                  <div
                    key={session.id}
                    className="card"
                    style={{
                      padding: '1.35rem 1.5rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {session.batch}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          textTransform: 'uppercase',
                          color: '#ffffff',
                        }}
                      >
                        {session.class_name}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          color: 'var(--primary-light)',
                        }}
                      >
                        {formatTime(session.start_time)} – {formatTime(session.end_time)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Trainer On Floor
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}
