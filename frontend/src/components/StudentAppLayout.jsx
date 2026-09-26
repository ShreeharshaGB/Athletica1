import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity as ActivityIcon,
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
  Users,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  ScanLine,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const studentNavItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Classrooms', path: '/student/classrooms', icon: BookOpen },
  { label: 'Physique Analysis', path: '/student/physique-analysis', icon: Sparkles },
  { label: 'Fitness Assessment', path: '/student/assessment', icon: ClipboardCheck },
  { label: 'Workout Plan', path: '/student/workout', icon: Dumbbell },
  { label: 'Nutrition', path: '/student/nutrition', icon: Apple },
  { label: 'AI Coach', path: '/student/coach', icon: MessageCircle },
  { label: 'Wellness', path: '/student/wellness', icon: HeartPulse },
  { label: 'Progress', path: '/student/progress', icon: TrendingUp },
  { label: 'Talent Discovery', path: '/student/talent', icon: Trophy },
  { label: 'Gamification', path: '/student/gamification', icon: Gamepad2 },
  { label: 'Fitness Passport', path: '/student/fitness-result', icon: Award },
]

const teacherNavItems = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Classrooms', path: '/teacher/classrooms', icon: BookOpen },
  { label: 'Student Insights', path: '/teacher/dashboard#insights', icon: TrendingUp, hash: '#insights' },
  { label: 'Talent Discovery', path: '/teacher/dashboard#talent', icon: Trophy, hash: '#talent' },
  { label: 'Students', path: '/teacher/dashboard#students', icon: Users, hash: '#students' },
  { label: 'Activities', path: '/teacher/dashboard#activities', icon: ActivityIcon, hash: '#activities' },
]

const communityNavItems = [
  { label: 'Community Hub', path: '/community/dashboard', icon: LayoutDashboard },
  { label: 'Challenges', path: '/community/dashboard#challenges', icon: Trophy, hash: '#challenges' },
  { label: 'Leaderboard', path: '/community/dashboard#leaderboard', icon: Award, hash: '#leaderboard' },
  { label: 'Members', path: '/community/dashboard#members', icon: Users, hash: '#members' },
  { label: 'Fitness Assessment', path: '/student/assessment', icon: ClipboardCheck },
  { label: 'Physique Analysis', path: '/student/physique-analysis', icon: Sparkles },
  { label: 'Nutrition', path: '/student/nutrition', icon: Apple },
  { label: 'AI Coach', path: '/student/coach', icon: MessageCircle },
  { label: 'Workout Plan', path: '/student/workout', icon: Dumbbell },
  { label: 'Progress', path: '/student/progress', icon: TrendingUp },
]

export default function StudentAppLayout({
  children,
  pageTitle,
  pageSubtitle,
  eyebrow,
  actions,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isTeacher = user?.role === 'teacher'
  const isCommunity = user?.role === 'community'
  const userName = user?.name || (isTeacher ? 'Faculty Coach' : isCommunity ? 'Community Athlete' : 'Athlete')
  const navItems = isTeacher ? teacherNavItems : isCommunity ? communityNavItems : studentNavItems
  const defaultEyebrow = isTeacher
    ? 'ATHLETICA FACULTY PORTAL'
    : isCommunity
      ? `ATHLETICA COMMUNITY • ${user?.communityId || 'MEMBER'}`
      : 'ATHLETICA STUDENT PORTAL'

  const handleNavClick = (path) => {
    setMobileMenuOpen(false)
    if (path.includes('#')) {
      const [route, hash] = path.split('#')
      if (location.pathname === route) {
        window.location.hash = hash
        window.dispatchEvent(new HashChangeEvent('hashchange'))
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate(path)
      }
    } else {
      navigate(path)
    }
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
            <span>
              {isTeacher
                ? 'Faculty & Institution'
                : isCommunity
                  ? `Community • ${user?.communityId || 'Member'}`
                  : 'Fitness & Wellness'}
            </span>
          </div>
        </Link>

        <p className="ath-sidebar-menu-kicker">
          {isTeacher ? 'Faculty Portal' : isCommunity ? 'Community Hub' : 'Menu'}
        </p>

        <nav className="ath-sidebar-nav" aria-label={isTeacher ? 'Faculty Navigation' : 'Student Navigation'}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (item.hash && location.pathname + location.hash === item.path)
            return (
              <button
                key={item.label}
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
          {!isTeacher && (
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
          )}
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
              <h1>{pageTitle || `Good day, ${userName} 👋`}</h1>
              <p>
                {pageSubtitle ||
                  (isTeacher
                    ? `Faculty Portal • Institution: ${user?.institutionId || 'General'}`
                    : isCommunity
                      ? `Community Portal • ${user?.communityId || 'General'}`
                      : 'Ready to improve your fitness today?')}
              </p>
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

            <div className="ath-user-profile-btn" style={{ cursor: 'default' }}>
              <div
                className="ath-avatar"
                style={
                  isTeacher
                    ? { background: '#0f766e' }
                    : isCommunity
                      ? { background: '#d97706' }
                      : undefined
                }
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="ath-user-meta">
                <span className="ath-user-name">{userName}</span>
                <span className="ath-user-role">
                  {isTeacher
                    ? `Teacher • ${user?.institutionId || 'Faculty'}`
                    : isCommunity
                      ? `Community • ${user?.communityId || 'Member'}`
                      : 'Student Athlete'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CENTERED CONTENT CONTAINER */}
        <main className="ath-container">
          {(eyebrow || defaultEyebrow) && !pageTitle && (
            <div className="ath-eyebrow">{eyebrow || defaultEyebrow}</div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
