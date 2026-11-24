import { Link } from 'react-router-dom'
import { BUSINESS } from '../lib/business'
import Layout from '../components/Layout'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          color: 'var(--primary)',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginTop: '0.35rem',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function FeatureCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <div
      className="card"
      style={{
        padding: '1.75rem',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          padding: '0.25rem 0.6rem',
          borderRadius: '4px',
          background: 'var(--primary-subtle)',
          color: 'var(--primary-light)',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        {tag}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.35rem',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}

export default function Home() {
  const trialWhatsappUrl = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    "Hi! I'd like to book a free trial session at Body Line Fitness Center, Nandakumar."
  )}`

  return (
    <Layout>
      {/* =========================================================
          HERO SECTION (High-Contrast Photography First)
      ========================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#09090b',
        }}
      >
        {/* Real Gym Background Photo with Atmospheric Dark Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('/photos/hero-gym.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.38,
            filter: 'contrast(1.1) brightness(0.85)',
          }}
        />

        {/* Gradient Overlay for 100% Legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #09090b 0%, rgba(9, 9, 11, 0.8) 40%, rgba(9, 9, 11, 0.6) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '3.5rem 1.25rem' }}>
          <div style={{ maxWidth: '680px' }}>
            {/* Google Rating Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ color: '#facc15', fontSize: '0.85rem' }}>★ 4.7</span>
              <span
                style={{
                  color: '#fef08a',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Top Rated on Google · Nandakumar
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2.75rem, 8vw, 5.5rem)',
                lineHeight: 0.96,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ display: 'block', color: '#ffffff' }}>Build Strength.</span>
              <span style={{ display: 'block', color: 'var(--primary)' }}>Own Your Body.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '520px',
                marginBottom: '2rem',
              }}
            >
              Nandakumar&apos;s premier training center. Complete with heavy iron, dedicated boxing heavy bags, cable machines, and certified personal coaching.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={trialWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Book Free Trial
              </a>
              <Link to="/membership" className="btn btn-outline btn-lg">
                View Plans & Fees
              </Link>
            </div>

            {/* Quick Benefits Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '2rem',
              }}
            >
              {['24/7 Access', 'Heavy Dumbbells & Bars', 'Boxing Station', 'Certified Trainers'].map(pill => (
                <span
                  key={pill}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS BAR
      ========================================================= */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '1.75rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
            }}
            className="stats-row"
          >
            <Stat value="24/7" label="Gym Access" />
            <Stat value="4.7★" label="Google Rating" />
            <Stat value="100+" label="Active Members" />
            <Stat value="5+" label="Years Strong" />
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .stats-row {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 1rem !important;
            }
          }
        `}</style>
      </section>

      {/* =========================================================
          FACILITY & TRAINING ZONES (Real Photography)
      ========================================================= */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Training Facility</div>
            <h2 className="section-title">Built for Serious Training</h2>
            <p className="section-subtitle">
              Every section of our gym is arranged for maximum efficiency — from heavy powerlifting to explosive combat training.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                title: 'Free Weights & Dumbbells',
                desc: 'Heavy dumbbell racks, Olympic barbells, flat & incline benches for serious hypertrophy.',
                image: '/photos/strength-floor.jpg',
              },
              {
                title: 'Boxing & Combat Station',
                desc: 'Dedicated heavy leather punching bags and strike training for conditioning and endurance.',
                image: '/photos/boxing-zone.jpg',
              },
              {
                title: 'Cable & Pulley Systems',
                desc: 'Lat pulldowns, seated cable rows, and crossover stations for targeted muscle isolation.',
                image: '/photos/gym-floor.jpg',
              },
              {
                title: 'Cardio & Conditioning',
                desc: 'Treadmills and functional fitness circuits for stamina building and fast fat loss.',
                image: '/photos/cardio-zone.jpg',
              },
            ].map(zone => (
              <div
                key={zone.title}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ aspectRatio: '16/10', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={zone.image}
                    alt={zone.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(9,9,11,0.85) 0%, transparent 60%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '1rem',
                      right: '1rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      textTransform: 'uppercase',
                      color: '#ffffff',
                    }}
                  >
                    {zone.title}
                  </div>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {zone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY BODY LINE
      ========================================================= */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Why Body Line</div>
            <h2 className="section-title">The Complete Gym Experience</h2>
            <p className="section-subtitle">
              We focus on what actually matters: solid equipment, dedicated coaching, and an encouraging community.
            </p>
          </div>

          <div className="grid-4">
            <FeatureCard
              tag="24/7 Access"
              title="Train on Your Schedule"
              desc="Open 24 hours every day. Train early morning or late night with full biometric / key access."
            />
            <FeatureCard
              tag="Real Equipment"
              title="Heavy Strength Gear"
              desc="Olympic bars, bumper plates, power racks, and heavy dumbbells up to 40kg for serious lifters."
            />
            <FeatureCard
              tag="Combat Sports"
              title="Boxing Heavy Bags"
              desc="Full boxing station with heavy bags for combat conditioning, cardio stamina, and stress relief."
            />
            <FeatureCard
              tag="Community"
              title="Positive Atmosphere"
              desc="Motivating training culture where beginners and competitive athletes support each other."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          MEMBERSHIP TEASER
      ========================================================= */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Transparent Pricing</div>
          <h2 className="section-title">Membership Plans</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem' }}>
            Straightforward pricing with no hidden charges. Choose what fits your training routine.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              maxWidth: '960px',
              margin: '0 auto 2.5rem',
              textAlign: 'left',
            }}
          >
            {[
              { name: 'Monthly', price: '600', duration: '1 Month', popular: false },
              { name: 'Quarterly', price: '1,600', duration: '3 Months', popular: false },
              { name: 'Half-Yearly', price: '2,800', duration: '6 Months', popular: true },
              { name: 'Annual', price: '5,000', duration: '12 Months', popular: false },
            ].map(plan => (
              <div
                key={plan.name}
                className="card"
                style={{
                  padding: '1.75rem 1.5rem',
                  borderRadius: '14px',
                  border: plan.popular ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: plan.popular ? 'rgba(225, 29, 72, 0.05)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', textTransform: 'uppercase' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {plan.duration}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>₹</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                    {plan.price}
                  </span>
                </div>
                <Link
                  to="/membership"
                  className={plan.popular ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ width: '100%', marginTop: 'auto', textAlign: 'center' }}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/membership" className="btn btn-outline">
              Compare All Plans &amp; Benefits
            </Link>
            <a href={trialWhatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Book Free Trial on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOCATION & HOURS (Nandakumar Local Card)
      ========================================================= */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignItems: 'center',
            }}
            className="location-grid"
          >
            <div>
              <div className="section-label">Visit Us in Nandakumar</div>
              <h2 className="section-title">Open 24 Hours Every Day</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Located right near Basudevpur Maharaj High School and Jana Steel Furnitures in Nandakumar. Drop in anytime to inspect the equipment or start your trial workout.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>📍</div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>Address:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {BUSINESS.address}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>📞</div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>Phone &amp; WhatsApp:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <a href={`tel:${BUSINESS.phoneRaw}`} style={{ color: '#ffffff', textDecoration: 'underline' }}>
                        {BUSINESS.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 800 }}>⏰</div>
                  <div>
                    <strong style={{ color: '#ffffff' }}>Operating Hours:</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      24 Hours Open · 7 Days a Week
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Get Google Maps Directions
                </a>
                <a
                  href={`tel:${BUSINESS.phoneRaw}`}
                  className="btn btn-primary"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                aspectRatio: '4/3',
                background: 'var(--bg-card)',
              }}
            >
              <iframe
                title="Body Line Fitness Center Location"
                src={BUSINESS.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .location-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>
    </Layout>
  )
}
