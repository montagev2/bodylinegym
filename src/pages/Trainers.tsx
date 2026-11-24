import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTrainers } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymTrainer } from '../types'

const REAL_TRAINERS: GymTrainer[] = [
  {
    id: 'coach-1',
    full_name: 'Head Coach (Strength & Bodybuilding)',
    phone: BUSINESS.phone,
    email: null,
    photo_url: '/photos/coach-head.jpg',
    specializations: ['Strength & Powerlifting', 'Bodybuilding', 'Muscle Hypertrophy', 'Form Correction'],
    bio: 'Certified strength and conditioning specialist with 5+ years of hands-on coaching in Nandakumar. Focused on progressive overload, injury-free heavy lifting, and personalized nutrition guidance.',
    experience_years: 5,
    certifications: ['Certified Personal Trainer', 'Sports Nutrition Specialist'],
    is_active: true,
    sort_order: 1,
    created_at: '',
  },
  {
    id: 'coach-2',
    full_name: 'Combat & Conditioning Specialist',
    phone: null,
    email: null,
    photo_url: '/photos/coach-boxing.jpg',
    specializations: ['Boxing Fundamentals', 'Heavy Bag Conditioning', 'HIIT & Fat Loss', 'Athletic Stamina'],
    bio: 'Boxing and functional endurance coach dedicated to combat sports training, high-energy cardio circuits, and aggressive fat loss conditioning.',
    experience_years: 4,
    certifications: ['Combat Sports Conditioning Coach', 'HIIT Circuit Specialist'],
    is_active: true,
    sort_order: 2,
    created_at: '',
  },
]

function TrainerCard({ trainer }: { trainer: GymTrainer }) {
  const photo = trainer.photo_url || (trainer.sort_order === 2 ? '/photos/coach-boxing.jpg' : '/photos/coach-head.jpg')
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    `Hi! I'd like to book personal training with ${trainer.full_name} at Body Line Fitness Center, Nandakumar.`
  )}`

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* High-res Coach Photo */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/4.5',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}
      >
        <img
          src={photo}
          alt={trainer.full_name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Subtle Dark Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.2) 50%, transparent 100%)',
          }}
        />

        {/* Experience Pill */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(9, 9, 11, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {trainer.experience_years}+ Years Experience
        </div>

        {/* Name on Photo */}
        <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
              textTransform: 'uppercase',
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            {trainer.full_name}
          </h3>
        </div>
      </div>

      {/* Info Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Specializations Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
          {trainer.specializations.map(spec => (
            <span
              key={spec}
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Bio */}
        {trainer.bio && (
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              marginBottom: '1.25rem',
              flex: 1,
            }}
          >
            {trainer.bio}
          </p>
        )}

        {/* Certifications List */}
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div style={{ marginBottom: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginBottom: '0.4rem',
              }}
            >
              Verified Credentials
            </div>
            {trainer.certifications.map(cert => (
              <div
                key={cert}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.2rem',
                }}
              >
                <span style={{ color: 'var(--primary)', fontSize: '0.9rem', lineHeight: 1 }}>•</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Direct Action Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem 1rem' }}
        >
          Book 1-on-1 Training
        </a>
      </div>
    </div>
  )
}

export default function Trainers() {
  const [trainers, setTrainers] = useState<GymTrainer[]>(REAL_TRAINERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrainers()
      .then(data => {
        if (data && data.length > 0) {
          // Merge with real photos
          const merged = data.map((t, idx) => ({
            ...t,
            photo_url: t.photo_url || (idx === 1 ? '/photos/coach-boxing.jpg' : '/photos/coach-head.jpg'),
          }))
          setTrainers(merged)
        } else {
          setTrainers(REAL_TRAINERS)
        }
      })
      .catch(() => setTrainers(REAL_TRAINERS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      {/* Clean Modern Hero */}
      <section
        style={{
          background: 'linear-gradient(to bottom, #121215, #09090b)',
          padding: '4rem 0 3rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="section-label">Expert Coaching</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            Certified Trainers
          </h1>
          <p className="section-subtitle">
            Dedicated professionals with real strength and combat sports experience. Personalized workout plans, correct technique, and real results in Nandakumar.
          </p>
        </div>
      </section>

      {/* Trainers Grid */}
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                maxWidth: '960px',
                margin: '0 auto',
              }}
            >
              {trainers.map(trainer => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 1-on-1 Consultation Section */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <div className="section-label">Personal Coaching</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>
            Start With a Free Assessment
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
            Meet our coaches at the gym, assess your fitness baseline, and get a customized roadmap for muscle building or fat loss.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
                "Hi! I'd like to book a free fitness assessment session at Body Line Fitness Center, Nandakumar."
              )}` }
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              Chat on WhatsApp
            </a>
            <a href={`tel:${BUSINESS.phoneRaw}`} className="btn btn-outline btn-lg">
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
