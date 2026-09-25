import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Users, HeartPulse, ArrowRight, ShieldCheck } from 'lucide-react'
import './Welcome.css'

const roles = [
  {
    id: 'student',
    title: 'Student Athlete',
    badge: 'Fitness & Growth',
    icon: Sparkles,
    color: '#0f766e',
    bgColor: '#e6f7f2',
    description: 'Assess your fitness, receive personalized workout and nutrition plans, and track your daily streaks and physical progress.',
    path: '/student/login',
    highlights: ['Personalized AI Workouts', 'Nutrition & Hydration Guidance', 'Fitness Passport & Badges'],
  },
  {
    id: 'teacher',
    title: 'Physical Education Teacher',
    badge: 'Coaching & Oversight',
    icon: Users,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    description: 'Monitor your students’ fitness assessments, analyze cohort performance metrics, and guide students toward peak health.',
    path: '/teacher/login',
    highlights: ['Cohort Analytics', 'Fitness Score Verification', 'Talent Discovery Insights'],
  },
  {
    id: 'community',
    title: 'Community Person',
    badge: 'Everyday Wellness',
    icon: HeartPulse,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    description: 'Simplified fitness routines designed for all fitness levels with low-bandwidth support for accessible movement anywhere.',
    path: '/community/login',
    highlights: ['Offline-Friendly Routines', 'Simple Movement Habits', 'Community Health Support'],
  },
]

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <main className="welcome-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Athletica home">
          <span className="brand-mark">A<span>+</span></span>
          <span>ATHLETICA</span>
        </Link>
        <Link to="/" style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to Overview
        </Link>
      </header>

      <section style={{ maxWidth: '1100px', margin: '40px auto 60px', padding: '0 24px', flex: 1, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#e6f7f2', color: '#0f766e', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <ShieldCheck size={16} /> Choose Your Portal
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Select your role in Athletica
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
            Every path in Athletica is tailored with specific tools to support your fitness, education, and health journey.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                onClick={() => navigate(role.path)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = role.color
                  e.currentTarget.style.boxShadow = `0 16px 32px ${role.color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: role.bgColor, color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: role.color, background: role.bgColor, padding: '4px 10px', borderRadius: '12px' }}>
                    {role.badge}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                  {role.title}
                </h2>

                <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 20px', flex: 1 }}>
                  {role.description}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Highlights</span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {role.highlights.map((h, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: role.color, fontWeight: 700 }}>✓</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="ath-btn ath-btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Continue as {role.id === 'student' ? 'Student' : role.id === 'teacher' ? 'Teacher' : 'Community'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="site-footer">
        <div className="brand"><span className="brand-mark">A<span>+</span></span><span>ATHLETICA</span></div>
        <span>Move well. Live fully.</span>
        <span>© 2026 Athletica</span>
      </footer>
    </main>
  )
}
