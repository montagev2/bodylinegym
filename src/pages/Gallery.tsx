import Layout from '../components/Layout'
import { BUSINESS } from '../lib/business'

// Static gallery items — Google Maps gym photos (we can add real URLs later)
const GALLERY_ITEMS = [
  { id: 1, title: 'Weight Training Floor', category: 'equipment', placeholder: 'WT' },
  { id: 2, title: 'Boxing Training Zone', category: 'boxing', placeholder: 'BX' },
  { id: 3, title: 'Community', category: 'community', placeholder: 'CM' },
  { id: 4, title: 'Cardio Zone', category: 'equipment', placeholder: 'CD' },
  { id: 5, title: 'Cable Crossover', category: 'equipment', placeholder: 'CC' },
  { id: 6, title: 'Team Training', category: 'community', placeholder: 'TT' },
  { id: 7, title: 'Strength Area', category: 'equipment', placeholder: 'ST' },
  { id: 8, title: 'Members', category: 'community', placeholder: 'MB' },
  { id: 9, title: 'Heavy Bag Zone', category: 'boxing', placeholder: 'HB' },
]

const CATEGORIES = ['All', 'Equipment', 'Boxing', 'Community']

const CATEGORY_COLORS: Record<string, string> = {
  equipment: 'var(--primary)',
  boxing: 'var(--gold)',
  community: '#4ade80',
}

import { useState } from 'react'

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory.toLowerCase())

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
          <div className="section-label">Photos</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>Gallery</h1>
          <p className="section-subtitle">
            Take a look inside Body Line Fitness Center — the equipment, the community, the atmosphere.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="section">
        <div className="container">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: `2px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}>
            {filtered.map((item, i) => {
              const isLarge = i === 0 || i === 4
              return (
                <div
                  key={item.id}
                  style={{
                    gridColumn: isLarge ? 'span 1' : undefined,
                    aspectRatio: isLarge ? '4/3' : '1',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'scale(1.02)'
                    el.style.boxShadow = 'var(--shadow-lg)'
                    el.style.zIndex = '2'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'scale(1)'
                    el.style.boxShadow = 'none'
                    el.style.zIndex = '1'
                  }}
                >
                  {/* Placeholder gradient background */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, #0f0f0f, #1a0505)`,
                  }} />

                  {/* Large placeholder text */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: 'rgba(220,38,38,0.08)',
                    textTransform: 'uppercase',
                  }}>
                    {item.placeholder}
                  </div>

                  {/* Category color accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: CATEGORY_COLORS[item.category] ?? 'var(--primary)',
                  }} />

                  {/* Overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 60%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '1rem',
                  }}>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px',
                        background: `${CATEGORY_COLORS[item.category] ?? 'var(--primary)'}25`,
                        border: `1px solid ${CATEGORY_COLORS[item.category] ?? 'var(--primary)'}50`,
                        color: CATEGORY_COLORS[item.category] ?? 'var(--primary)',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.4rem',
                      }}>
                        {item.category}
                      </span>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        color: 'white',
                        letterSpacing: '0.03em',
                      }}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Google Maps photos link */}
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              See more real photos from our members on Google Maps
            </p>
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View All Photos on Google Maps
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
