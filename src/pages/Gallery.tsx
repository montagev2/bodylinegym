import { useState } from 'react'
import Layout from '../components/Layout'
import { BUSINESS } from '../lib/business'

const GALLERY_ITEMS = [
  { id: 1, title: 'Olympic Free Weights & Dumbbells', category: 'equipment', image: '/photos/strength-floor.jpg' },
  { id: 2, title: 'Heavy Boxing Bag Station', category: 'boxing', image: '/photos/boxing-zone.jpg' },
  { id: 3, title: 'Training Community & Athletes', category: 'community', image: '/photos/community.jpg' },
  { id: 4, title: 'Cable Crossover & Pulley Systems', category: 'equipment', image: '/photos/gym-floor.jpg' },
  { id: 5, title: 'Cardio & Conditioning Zone', category: 'equipment', image: '/photos/cardio-zone.jpg' },
  { id: 6, title: 'Atmospheric Main Floor', category: 'equipment', image: '/photos/hero-gym.jpg' },
  { id: 7, title: '1-on-1 Coaching & Form Guidance', category: 'community', image: '/photos/coach-head.jpg' },
  { id: 8, title: 'Combat Conditioning & Speed Drills', category: 'boxing', image: '/photos/coach-boxing.jpg' },
]

const CATEGORIES = ['All', 'Equipment', 'Boxing', 'Community']

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory.toLowerCase())

  return (
    <Layout>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(to bottom, #121215, #09090b)',
          padding: '4rem 0 2.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div className="section-label">Inside Body Line</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            Facility Gallery
          </h1>
          <p className="section-subtitle">
            Take a look inside Body Line Fitness Center in Nandakumar — the heavy iron, boxing bags, cable stations, and community.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section">
        <div className="container">
          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    background: isActive ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Real Photo Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filtered.map(item => (
              <div
                key={item.id}
                className="card"
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  aspectRatio: '16/11',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                />

                {/* Subtle vignette gradient */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(9, 9, 11, 0.9) 0%, rgba(9, 9, 11, 0.1) 50%, transparent 100%)',
                  }}
                />

                {/* Label Overlay */}
                <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {item.category}
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                      letterSpacing: '0.02em',
                      lineHeight: 1.15,
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Google Maps link card */}
          <div
            style={{
              marginTop: '3rem',
              padding: '1.75rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  marginBottom: '0.25rem',
                }}
              >
                More Photos on Google Maps
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Check out real unedited pictures uploaded by members on our official Google Maps profile.
              </p>
            </div>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Google Maps Photos
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
