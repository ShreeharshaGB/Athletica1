import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Trophy,
  Gamepad2,
  Award,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Fitness Assessment', path: '/student/assessment', icon: ClipboardCheck },
  { label: 'Workout Plan', path: '/student/workout', icon: Dumbbell },
  { label: 'Nutrition', path: '/student/nutrition', icon: Apple },
  { label: 'Wellness', path: '/student/wellness', icon: HeartPulse },
  { label: 'Progress', path: '/student/progress', icon: TrendingUp },
  { label: 'Talent Discovery', path: '/student/talent', icon: Trophy },
  { label: 'Gamification', path: '/student/gamification', icon: Gamepad2 },
  { label: 'Fitness Passport', path: '/student/fitness-result', icon: Award },
]

export default function StudentAppLayout({
  children,
  pageTitle,
  pageSubtitle,
  eyebrow = 'ATHLETICA STUDENT PORTAL',
  actions,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const studentName = user?.name || 'Athlete'

  const handleNavClick = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="ath-shell">
      {/* Mobile Backdrop */}
      <div
        className={`ath-sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ================= SIDEBAR ================= */}
      <aside className={`ath-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <Link
          to="/"
          className="ath-sidebar-brand"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Athletica home"
        >
          <div className="ath-brand-badge">
            A<span>+</span>
          </div>
          <div className="ath-brand-text">
            <h2>ATHLETICA</h2>
            <span>Fitness & Wellness</span>
          </div>
        </Link>

        <p className="ath-sidebar-menu-kicker">Menu</p>

        <nav className="ath-sidebar-nav" aria-label="Student Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                type="button"
                className={`ath-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                <div className="ath-nav-icon-wrap">
                  <Icon size={19} />
                </div>
                <span className="ath-nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="ath-sidebar-footer">
          <button
            type="button"
            className={`ath-nav-btn ${location.pathname === '/student/profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('/student/profile')}
          >
            <div className="ath-nav-icon-wrap">
              <User size={19} />
            </div>
            <span className="ath-nav-label">Profile</span>
          </button>
          <button
            type="button"
            className="ath-nav-btn"
            style={{ color: '#ef4444' }}
            onClick={handleLogout}
          >
            <div className="ath-nav-icon-wrap">
              <LogOut size={19} />
            </div>
            <span className="ath-nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN APPLICATION AREA ================= */}
      <div className="ath-main-shell">
        {/* TOPBAR */}
        <header className="ath-topbar">
          <div className="ath-topbar-left">
            <button
              className="ath-mobile-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ath-topbar-heading">
              <h1>{pageTitle || `Good day, ${studentName} 👋`}</h1>
              <p>{pageSubtitle || 'Ready to improve your fitness today?'}</p>
            </div>
          </div>

          <div className="ath-topbar-right">
            {actions && <div className="ath-topbar-actions">{actions}</div>}

            <button
              className="ath-icon-btn"
              type="button"
              aria-label="Notifications"
              onClick={() => alert('No new notifications today. Keep moving!')}
            >
              <Bell size={18} />
              <span className="ath-notify-dot" />
            </button>

            <Link to="/student/profile" className="ath-user-profile-btn" aria-label="Go to Profile">
              <div className="ath-avatar">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="ath-user-meta">
                <span className="ath-user-name">{studentName}</span>
                <span className="ath-user-role">Student Athlete</span>
              </div>
            </Link>
          </div>
        </header>

        {/* CENTERED CONTENT CONTAINER */}
        <main className="ath-container">
          {eyebrow && !pageTitle && (
            <div className="ath-eyebrow">{eyebrow}</div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
