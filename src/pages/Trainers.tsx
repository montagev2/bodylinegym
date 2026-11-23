import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTrainers } from '../lib/api'
import { BUSINESS } from '../lib/business'
import type { GymTrainer } from '../types'

const FALLBACK_TRAINERS: GymTrainer[] = [
  {
    id: '1',
    full_name: 'Head Trainer',
    phone: BUSINESS.phone,
    email: null,
    photo_url: null,
    specializations: ['Strength & Conditioning', 'Boxing', 'Weight Training', 'Cardio'],
    bio: 'Certified fitness trainer with over 5 years of experience helping members achieve their strength and physique goals. Expert in boxing fundamentals and combat sports conditioning.',
    experience_years: 5,
    certifications: ['Certified Personal Trainer', 'Boxing Coach'],
    is_active: true,
    sort_order: 1,
    created_at: '',
  },
  {
    id: '2',
    full_name: 'Strength Coach',
    phone: null,
    email: null,
    photo_url: null,
    specializations: ['Powerlifting', 'Bodybuilding', 'Muscle Building', 'Nutrition'],
    bio: 'Specializes in body recomposition and muscle building programs. Helping athletes go from beginner to advanced with structured periodized programming.',
    experience_years: 4,
    certifications: ['Strength & Conditioning Specialist'],
    is_active: true,
    sort_order: 2,
    created_at: '',
  },
]

function TrainerCard({ trainer }: { trainer: GymTrainer }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Photo / placeholder */}
      <div style={{
        aspectRatio: '3/4',
        background: 'linear-gradient(145deg, #111, #1a0505)',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        {trainer.photo_url ? (
          <img
            src={trainer.photo_url}
            alt={trainer.full_name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '5rem',
              fontWeight: 900,
              color: 'rgba(220,38,38,0.08)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
              userSelect: 'none',
            }}>
              {trainer.full_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          </div>
        )}

        {/* Experience badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'var(--primary)',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0.3rem 0.75rem',
          borderRadius: '4px',
        }}>
          {trainer.experience_years}+ Yrs
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(8,8,8,0.9), transparent)',
          zIndex: 1,
        }} />

        {/* Name on photo */}
        <div style={{ position: 'relative', zIndex: 2, padding: '1.25rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            color: 'white',
          }}>
            {trainer.full_name}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.5rem' }}>
        {/* Specializations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {trainer.specializations.map(s => (
            <span key={s} className="badge badge-red">{s}</span>
          ))}
        </div>

        {/* Bio */}
        {trainer.bio && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            {trainer.bio}
          </p>
        )}

        {/* Certifications */}
        {trainer.certifications.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Certifications
            </div>
            {trainer.certifications.map(cert => (
              <div key={cert} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem',
              }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>{'★'}</span>
                {cert}
              </div>
            ))}
          </div>
        )}

        {/* Book session */}
        <a
          href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(`Hi! I'd like to book a personal training session with ${trainer.full_name} at Body Line Fitness Center.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem' }}
        >
          Book a Session
        </a>
      </div>
    </div>
  )
}

export default function Trainers() {
  const [trainers, setTrainers] = useState<GymTrainer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrainers()
      .then(data => setTrainers(data.length > 0 ? data : FALLBACK_TRAINERS))
      .catch(() => setTrainers(FALLBACK_TRAINERS))
      .finally(() => setLoading(false))
  }, [])

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
          <div className="section-label">Expert Team</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Our Trainers</h1>
          <p className="section-subtitle">
            Certified professionals dedicated to helping you reach your peak physical condition.
          </p>
        </div>
      </section>

      {/* Trainers grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
            }}>
              {trainers.map(trainer => (
                <TrainerCard key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PT CTA */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Personal Training</div>
          <h2 className="section-title">Train 1-on-1</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem' }}>
            Get a customized workout plan, nutritional guidance, and dedicated coaching with our personal training package.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent("Hi! I'm interested in personal training at Body Line Fitness Center. Please share details.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              Book Personal Training
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
