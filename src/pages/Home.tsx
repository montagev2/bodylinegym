import { Link } from 'react-router-dom'
import { BUSINESS } from '../lib/business'
import Layout from '../components/Layout'

// Stat item
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 900,
        color: 'var(--primary)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
        {label}
      </div>
    </div>
  )
}

// Feature card
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const icons: Record<string, string> = {
    clock: '24',
    dumbbell: 'DB',
    boxing: 'BX',
    star: '4.7',
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '2rem 1.5rem',
      transition: 'all 0.25s ease',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--primary)'
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = 'var(--shadow-red)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--border)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: '52px',
        height: '52px',
        background: 'rgba(220,38,38,0.12)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: '0.85rem',
        color: 'var(--primary)',
        letterSpacing: '0.03em',
      }}>
        {icons[icon] ?? 'GYM'}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '1.25rem',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)',
      }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {desc}
      </p>
    </div>
  )
}

// Equipment item
function EquipmentTag({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      padding: '0.4rem 0.875rem',
      borderRadius: '4px',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      color: 'var(--text-secondary)',
      fontSize: '0.85rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}

export default function Home() {
  return (
    <Layout>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 70% 50%, rgba(220,38,38,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(220,38,38,0.05) 0%, transparent 50%)
          `,
        }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }} />

        {/* Red vertical accent */}
        <div style={{
          position: 'absolute',
          right: '8%',
          top: '10%',
          bottom: '10%',
          width: '3px',
          background: 'linear-gradient(to bottom, transparent, var(--primary) 30%, var(--primary) 70%, transparent)',
          opacity: 0.4,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '760px' }}>
            {/* Rating badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              background: 'rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.3)',
              marginBottom: '2rem',
              animation: 'fadeInUp 0.5s ease',
            }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{'★'.repeat(5)}</span>
              <span style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                {BUSINESS.rating} RATED ON GOOGLE &bull; NANDAKUMAR
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              marginBottom: '1.5rem',
              animation: 'fadeInUp 0.6s ease 0.1s both',
            }}>
              <span style={{ display: 'block', color: 'var(--text-primary)' }}>Forge</span>
              <span style={{ display: 'block', color: 'var(--primary)' }}>Your</span>
              <span style={{ display: 'block', color: 'var(--text-primary)' }}>Limits.</span>
            </h1>

            {/* Subheading */}
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '520px',
              marginBottom: '2.5rem',
              animation: 'fadeInUp 0.6s ease 0.2s both',
            }}>
              Body Line Fitness Center — Nandakumar&apos;s premier gym. Modern equipment, certified trainers, 
              boxing &amp; combat training. Open 24 hours, every day.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              animation: 'fadeInUp 0.6s ease 0.3s both',
            }}>
              <a
                href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%27d%20like%20to%20book%20a%20free%20trial%20at%20Body%20Line%20Fitness%20Center.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Start Free Trial
              </a>
              <Link to="/membership" className="btn btn-outline btn-lg">
                View Plans
              </Link>
            </div>

            {/* Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '2.5rem',
              animation: 'fadeInUp 0.6s ease 0.4s both',
            }}>
              {['24/7 Open', 'Modern Equipment', 'Boxing Training', 'Certified Trainers'].map(tag => (
                <span key={tag} style={{
                  padding: '0.35rem 0.875rem',
                  borderRadius: '999px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.4,
          animation: 'fadeIn 1s ease 1s both',
        }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Scroll</span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, var(--text-muted), transparent)',
          }} />
        </div>
      </section>

      {/* =========================================================
          STATS BAR
      ========================================================= */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}>
            <Stat value="4.7★" label="Google Rating" />
            <Stat value="24/7" label="Always Open" />
            <Stat value="100+" label="Active Members" />
            <Stat value="5+" label="Years Serving" />
          </div>
        </div>
        <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* =========================================================
          WHY CHOOSE US
      ========================================================= */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Why Body Line</div>
            <h2 className="section-title">Built for Champions</h2>
            <p className="section-subtitle">
              Everything you need to build your best physique — under one roof in Nandakumar.
            </p>
          </div>

          <div className="grid-4">
            {BUSINESS.features.map(f => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          EQUIPMENT SECTION
      ========================================================= */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div className="section-label">Equipment</div>
              <h2 className="section-title">World-Class Gear</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                Our facility features professional-grade equipment for every fitness goal — from heavy powerlifting 
                to cardio endurance and combat sports training.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  'Cable Crossover',
                  'Olympic Barbells',
                  'Lat Pulldown',
                  'Incline Bench',
                  'Heavy Boxing Bags',
                  'Cardio Zone',
                  'Dumbbell Rack',
                  'Leg Press',
                  'Smith Machine',
                  'Battle Ropes',
                ].map(eq => (
                  <EquipmentTag key={eq} label={eq} />
                ))}
              </div>
              <Link to="/gallery" className="btn btn-primary">
                View Gallery
              </Link>
            </div>
            <div>
              {/* Visual placeholder with gym atmosphere */}
              <div style={{
                aspectRatio: '4/3',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, transparent 50%, rgba(220,38,38,0.04) 100%)',
                }} />
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '5rem',
                  fontWeight: 900,
                  color: 'rgba(220,38,38,0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  lineHeight: 0.9,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  BODY<br />LINE
                </div>
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                }}>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    View Gym Photos on Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MEMBERSHIP TEASER
      ========================================================= */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Membership Plans</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>
            Flexible plans designed for every commitment level. No hidden fees.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 3rem',
          }}>
            {[
              { name: 'Monthly', price: '600', note: '/month', popular: false },
              { name: 'Quarterly', price: '1,600', note: '/3 months', popular: false },
              { name: 'Half-Yearly', price: '2,800', note: '/6 months', popular: true },
              { name: 'Annual', price: '5,000', note: '/year', popular: false },
            ].map(plan => (
              <div
                key={plan.name}
                style={{
                  background: plan.popular ? 'var(--primary)' : 'var(--bg-card)',
                  border: `1px solid ${plan.popular ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--gold)',
                    color: 'var(--text-inverse)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                  }}>
                    Best Value
                  </div>
                )}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: plan.popular ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                }}>
                  {plan.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '2.5rem',
                  color: plan.popular ? 'white' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  <span style={{ fontSize: '1.25rem', verticalAlign: 'super' }}></span>
                  {plan.price}
                </div>
                <div style={{
                  color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  marginTop: '0.25rem',
                }}>
                  {plan.note}
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>
            * Pricing is indicative. Admission fee may apply. Final rates confirmed at the gym.
          </p>
          <Link to="/membership" className="btn btn-primary btn-lg">
            View All Plans
          </Link>
        </div>
      </section>

      {/* =========================================================
          LOCATION / CTA
      ========================================================= */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '5rem 0',
      }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #991b1b 100%)',
            borderRadius: '16px',
            padding: '3rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '2rem',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                color: 'white',
              }}>
                Ready to Transform?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                Visit us at {BUSINESS.area} &bull; {BUSINESS.hours} &bull; {BUSINESS.phone}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
                Near Basudevpur Maharaj Nandakumar High School
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
              <a
                href={`https://wa.me/${BUSINESS.whatsappNumber}?text=Hi!%20I%27m%20interested%20in%20joining%20Body%20Line%20Fitness%20Center.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: 'white', color: 'var(--primary)', borderColor: 'white', fontFamily: 'var(--font-display)', fontWeight: 700 }}
              >
                WhatsApp Us
              </a>
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
