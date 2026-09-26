import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Welcome.css'
import { useAuth } from '../context/AuthContext'

const roles = [
  { id: 'student', title: 'Student', description: 'Track fitness, get personalized plans and improve.', icon: 'spark', path: '/student/login' },
  { id: 'teacher', title: 'Teacher', description: 'Monitor student progress and discover potential.', icon: 'people', path: '/teacher/login' },
  { id: 'community', title: 'Community Person', description: 'Access simple fitness guidance with low-connectivity support.', icon: 'pulse', path: '/community/login' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    eye: <><path d="M2.5 12s3.2-5 9.5-5 9.5 5 9.5 5-3.2 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    people: <><circle cx="9" cy="9" r="3" /><path d="M3.5 19c.5-3 2.3-4.6 5.5-4.6s5 1.6 5.5 4.6M16 6.8a3 3 0 0 1 0 5.7M16.4 14.7c2.2.4 3.5 1.8 4.1 4.3" /></>,
    pulse: <path d="M3 12h3l2-5 4 10 2.2-5H21" />,
    spark: <path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" />,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.7-3.2 3-5 7-5s6.3 1.8 7 5" /></>,
  }
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Brand() {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = user?.role === 'teacher' ? '/teacher/dashboard' : user?.role === 'community' ? '/community/dashboard' : '/student/dashboard'
  return (
    <Link className="brand" to={isAuthenticated ? dashboardPath : '#top'} onClick={(e) => {
      if (!isAuthenticated) {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }} aria-label="Athletica home">
      <span className="brand-mark">A<span>+</span></span>
      <span>ATHLETICA</span>
    </Link>
  )
}

function ProgressVisual() {
  return (
    <div className="hero-visual" aria-label="Athletica dashboard preview">
      <div className="visual-grid" />
      <div className="visual-orb orb-one" />
      <div className="visual-orb orb-two" />
      <div className="stat-card assessment-card">
        <div className="stat-icon mint"><Icon name="pulse" size={18} /></div>
        <div><span>Assessment score</span><strong>84 <small>/ 100</small></strong></div>
        <span className="trend">+12%</span>
      </div>
      <div className="stat-card plan-card">
        <div className="plan-top">
          <div className="stat-icon orange"><Icon name="spark" size={17} /></div>
          <span>AI focus plan</span>
          <b>Today</b>
        </div>
        <strong>Build lower-body strength</strong>
        <div className="plan-progress"><span /></div>
        <small>3 of 4 sessions complete</small>
      </div>
      <div className="progress-card">
        <div className="progress-heading">
          <div><span>Weekly progress</span><strong>Keep your rhythm</strong></div>
          <span className="dots">•••</span>
        </div>
        <div className="chart">
          <i style={{ height: '36%' }} />
          <i style={{ height: '58%' }} />
          <i style={{ height: '46%' }} />
          <i className="active" style={{ height: '82%' }} />
          <i style={{ height: '66%' }} />
          <i style={{ height: '76%' }} />
          <i style={{ height: '52%' }} />
        </div>
        <div className="chart-labels">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
      <div className="discovery-chip">
        <span className="chip-avatar">✦</span>
        <div><b>Potential unlocked</b><small>New talent insight is ready</small></div>
        <Icon name="arrow" size={15} />
      </div>
      <div className="visual-tag tag-one"><span className="tag-dot mint-dot" />Personalized</div>
      <div className="visual-tag tag-two"><span className="tag-dot lavender-dot" />Discover more</div>
    </div>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [activeRole, setActiveRole] = useState('student')

  const handleRoleSelect = (roleId) => {
    setActiveRole(roleId)
    navigate(`/${roleId}/login`)
  }

  const dashboardPath = user?.role === 'teacher' ? '/teacher/dashboard' : user?.role === 'community' ? '/community/portal' : '/student/dashboard'

  return (
    <main id="top" className="welcome-page">
      <header className="site-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
        </nav>
        {isAuthenticated ? (
          <Link className="header-signin" to={dashboardPath}>
            Open Dashboard <Icon name="arrow" size={15} />
          </Link>
        ) : (
          <Link className="header-signin" to="/roles">
            Sign In <Icon name="arrow" size={15} />
          </Link>
        )}
      </header>

      <section className="hero" id="about">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />THE SMARTER WAY TO MOVE</div>
          <h1>Welcome to<br /><em>Athletica</em></h1>
          <p className="hero-subtitle">Your fitness journey, your way <span>—</span> wherever you are.</p>
          <p className="hero-description">
            Assess your fitness, get guidance that adapts to you, track meaningful progress and discover what your body is capable of.
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => navigate('/roles')}>
              Get Started <Icon name="arrow" size={18} />
            </button>
            <a className="secondary-action" href="#features">
              Explore Roles <span className="play-icon">▶</span>
            </a>
          </div>
          <div className="trust-row">
            <div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div>
            <p><strong>Built for every body</strong><br />A community that moves together</p>
          </div>
        </div>
        <ProgressVisual />
      </section>

      <section className="experience-section" id="features">
        <div className="section-heading">
          <div><p className="section-kicker">YOUR PATH, YOUR PACE</p><h2>Choose your experience</h2></div>
          <p>Start where you are. Athletica meets you there and grows with you.</p>
        </div>
        <div className="role-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`role-card ${activeRole === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <span className={`role-icon ${role.id}`}><Icon name={role.icon} size={23} /></span>
              <span className="role-card-title">{role.title}</span>
              <span className="role-card-description">{role.description}</span>
              <span className="role-check"><Icon name="arrow" size={14} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-badge"><Icon name="spark" size={20} /></div>
        <div>
          <p className="section-kicker">ONE PLATFORM, MANY POSSIBILITIES</p>
          <h2>Progress looks different<br />for everyone.</h2>
        </div>
        <p className="how-copy">
          From your first assessment to your next personal best, AI-powered insights turn small actions into lasting momentum.
        </p>
        <button className="outline-action" type="button" onClick={() => navigate('/roles')}>
          Find your starting point <Icon name="arrow" size={17} />
        </button>
      </section>

      <footer className="site-footer">
        <Brand />
        <span>Move well. Live fully.</span>
        <span>© 2026 Athletica</span>
      </footer>
    </main>
  )
}