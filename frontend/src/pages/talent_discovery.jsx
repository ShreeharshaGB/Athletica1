import { Sparkles } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const talents = [
  {
    category: 'Explosive Lower-Body Power',
    score: 91,
    tier: 'Exceptional (Top 5%)',
    description: 'Outstanding performance on shuttle run acceleration and vertical launch force.',
    potentialSports: ['Track & Field (Sprint)', 'Basketball', 'Football'],
    color: '#0f766e',
    bgColor: '#e6f7f2',
  },
  {
    category: 'Dynamic Cardiovascular Endurance',
    score: 84,
    tier: 'Strong (Top 15%)',
    description: 'High VO2 recovery rate during progressive intervals with minimal lactate fatigue.',
    potentialSports: ['Middle Distance Running', 'Badminton', 'Field Hockey'],
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  {
    category: 'Joint Mobility & Core Balance',
    score: 79,
    tier: 'Above Average',
    description: 'High sit-and-reach flexibility and solid pelvic stability under resistance.',
    potentialSports: ['Gymnastics', 'Swimming', 'Martial Arts'],
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
]

export default function TalentDiscovery() {
  return (
    <StudentAppLayout
      pageTitle="Talent Discovery & Athletic Potential"
      pageSubtitle="Algorithmic assessment of physiological strengths to match you with compatible competitive sports."
      eyebrow="TALENT IDENTIFICATION"
    >
      {/* HERO BANNER */}
      <div
        className="ath-card"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          <Sparkles size={14} /> AI Talent Engine
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
          Primary Strength: Speed & Explosive Acceleration
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, maxWidth: '640px', lineHeight: 1.55 }}>
          Your assessment metrics in shuttle agility and sprint timing place you in the top 8th percentile of student athletes for rapid direction changes and twitch fiber activation.
        </p>
      </div>

      {/* DETECTED TALENT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#0f172a', margin: '6px 0 0' }}>
          Identified Athletic Aptitudes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {talents.map((t, idx) => (
            <div key={idx} className="ath-card" style={{ gap: '14px', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="ath-badge" style={{ background: t.bgColor, color: t.color }}>{t.tier}</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: t.color }}>{t.score}/100</div>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0f172a', margin: '0 0 6px' }}>
                  {t.category}
                </h4>

                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {t.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Recommended Sports</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {t.potentialSports.map((sport, sIdx) => (
                    <span key={sIdx} className="ath-badge" style={{ background: '#f1f5f9', color: '#1e293b' }}>
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentAppLayout>
  )
}