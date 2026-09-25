import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  Play,
  Flame,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    assessment: null,
    plan: null,
  })

  const loadData = useCallback(() => {
    let active = true
    setLoading(true)
    setError('')

    Promise.allSettled([
      apiRequest('/student/profile'),
      apiRequest('/student/assessment'),
      apiRequest('/student/workout-plan'),
    ])
      .then(([profileRes, assessmentRes, planRes]) => {
        if (!active) return

        // 404 is an expected state for new users without assessment/plan
        const serverError = [profileRes, assessmentRes, planRes].find(
          (res) => res.status === 'rejected' && res.reason?.status >= 500
        )

        if (serverError) {
          setError('Unable to load your dashboard right now.')
        }

        setDashboardData({
          profile: profileRes.status === 'fulfilled' ? profileRes.value.profile : null,
          assessment: assessmentRes.status === 'fulfilled' ? assessmentRes.value.assessment : null,
          plan: planRes.status === 'fulfilled' ? planRes.value.plan : null,
        })
      })
      .catch(() => {
        if (active) setError('Unable to load your dashboard right now.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const cleanup = loadData()
    return cleanup
  }, [loadData])

  // Contextual Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const studentName = user?.name || dashboardData.profile?.userId?.name || 'Athlete'

  // BMI Calculation
  const bmiInfo = useMemo(() => {
    const { height, weight } = dashboardData.profile || {}
    if (!height || !weight) return null
    const heightInMeters = height / 100
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1)
    let category = 'Normal'
    if (bmi < 18.5) category = 'Underweight'
    else if (bmi >= 25 && bmi < 30) category = 'Overweight'
    else if (bmi >= 30) category = 'Obese'
    return { value: bmi, category }
  }, [dashboardData.profile])

  // Fitness Score
  const fitnessScore = useMemo(() => {
    const assessment = dashboardData.assessment
    if (!assessment) return null
    if (assessment.overallScore !== undefined) return assessment.overallScore
    if (assessment.pushUps !== undefined && assessment.sitUps !== undefined) {
      return Math.min(100, Math.round((assessment.pushUps * 2 + assessment.sitUps * 2) / 2))
    }
    return 75
  }, [dashboardData.assessment])

  // Today's workout
  const todayWorkout = useMemo(() => {
    const workouts = dashboardData.plan?.workouts
    if (!workouts || workouts.length === 0) return null
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayName = days[new Date().getDay()]
    const matching = workouts.find((w) => w.dayOfWeek?.toLowerCase() === todayName)
    return matching || workouts[0]
  }, [dashboardData.plan])

  // Day list for weekly progress
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayDayIndex = (new Date().getDay() + 6) % 7 // 0 = Mon, 6 = Sun

  const navLinks = [
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

  const handleNavClick = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="ath-dashboard-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className={`ath-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="ath-sidebar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="ath-brand-badge">
            A<span>+</span>
          </div>
          <div className="ath-brand-text">
            <h2>ATHLETICA</h2>
            <span>Fitness & Wellness</span>
          </div>
        </Link>

        <nav className="ath-sidebar-nav" aria-label="Sidebar navigation">
          <span className="ath-nav-section-title">Menu</span>
          {navLinks.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                type="button"
                className={`ath-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="ath-sidebar-footer">
          <button
            type="button"
            className="ath-nav-item"
            onClick={() => handleNavClick('/student/profile')}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            type="button"
            className="ath-nav-item"
            style={{ color: '#ef4444' }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN WRAPPER ================= */}
      <div className="ath-main-wrapper">
        {/* TOPBAR */}
        <header className="ath-topbar">
          <div className="ath-topbar-left">
            <button
              className="ath-mobile-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="ath-topbar-heading">
              <h1>
                {greeting}, {studentName} 👋
              </h1>
              <p>Ready to improve your fitness today?</p>
            </div>
          </div>

          <div className="ath-topbar-right">
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

        {/* LOADING STATE */}
        {loading && (
          <div className="ath-status-screen">
            <div className="ath-status-box">
              <div className="ath-spinner" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                Loading your fitness dashboard...
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Gathering your latest stats, active workout plan, and progress metrics.
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="ath-status-screen">
            <div className="ath-status-box">
              <div style={{ color: '#ef4444', marginBottom: '12px' }}>
                <Activity size={36} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                {error}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
                We could not connect to the Athletica services. Please try again.
              </p>
              <button
                type="button"
                className="ath-empty-cta"
                onClick={loadData}
                style={{ margin: '0 auto' }}
              >
                <RefreshCw size={14} /> Retry Loading
              </button>
            </div>
          </div>
        )}

        {/* MAIN DASHBOARD BODY */}
        {!loading && !error && (
          <main className="ath-dashboard-body">
            {/* ================= HERO / DAILY SUMMARY ================= */}
            <section className="ath-hero-banner" aria-label="Daily fitness summary">
              <div className="ath-hero-content">
                <div className="ath-hero-kicker">
                  <Sparkles size={14} /> Your Fitness Journey
                </div>
                <h2 className="ath-hero-title">
                  {dashboardData.assessment
                    ? 'Assessment verified & active!'
                    : 'Unlock your personalized training plan'}
                </h2>
                <p className="ath-hero-subtitle">
                  {dashboardData.assessment
                    ? `Fitness Level: ${dashboardData.assessment.fitnessLevel || 'Intermediate'}. Keep up the momentum this week.`
                    : 'Complete your initial fitness assessment to calculate your score and generate AI workout recommendations.'}
                </p>

                <div className="ath-hero-stats-row">
                  <div className="ath-hero-chip">
                    <Flame size={15} color="#f97316" />
                    <span>Active Streak: <strong>{dashboardData.assessment ? '3 Days' : '0 Days'}</strong></span>
                  </div>
                  <div className="ath-hero-chip">
                    <Activity size={15} color="#14b8a6" />
                    <span>Goal: <strong>{dashboardData.profile?.fitnessGoal || 'Stay Active'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="ath-hero-action">
                {dashboardData.assessment ? (
                  <Link to="/student/workout" className="ath-hero-btn">
                    <Play size={16} fill="currentColor" /> View Today&apos;s Workout
                  </Link>
                ) : (
                  <Link to="/student/assessment" className="ath-hero-btn">
                    Take Assessment <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </section>

            {/* ================= FITNESS OVERVIEW (METRICS) ================= */}
            <section className="ath-metrics-grid" aria-label="Fitness Overview">
              {/* BMI CARD */}
              <div className="ath-metric-card">
                <div className="ath-metric-top">
                  <div className="ath-metric-icon teal">
                    <HeartPulse size={20} />
                  </div>
                  {bmiInfo && (
                    <span className="ath-metric-tag positive">{bmiInfo.category}</span>
                  )}
                </div>
                <span className="ath-metric-label">Body Mass Index (BMI)</span>
                {bmiInfo ? (
                  <>
                    <div className="ath-metric-val-row">
                      <span className="ath-metric-value">{bmiInfo.value}</span>
                      <span className="ath-metric-sub">kg/m²</span>
                    </div>
                    <span className="ath-metric-sub">
                      Height: {dashboardData.profile.height} cm • Weight: {dashboardData.profile.weight} kg
                    </span>
                  </>
                ) : (
                  <div className="ath-metric-empty">
                    <p style={{ margin: 0 }}>Complete your profile to unlock your BMI calculation.</p>
                    <Link to="/student/profile" className="ath-metric-cta-link">
                      Update Profile →
                    </Link>
                  </div>
                )}
              </div>

              {/* FITNESS SCORE CARD */}
              <div className="ath-metric-card">
                <div className="ath-metric-top">
                  <div className="ath-metric-icon blue">
                    <Award size={20} />
                  </div>
                  {fitnessScore && (
                    <span className="ath-metric-tag positive">
                      {dashboardData.assessment?.fitnessLevel || 'Good'}
                    </span>
                  )}
                </div>
                <span className="ath-metric-label">Fitness Score</span>
                {fitnessScore !== null ? (
                  <>
                    <div className="ath-metric-val-row">
                      <span className="ath-metric-value">{fitnessScore}</span>
                      <span className="ath-metric-sub">/ 100</span>
                    </div>
                    <span className="ath-metric-sub">
                      {dashboardData.assessment?.pushUps !== undefined
                        ? `Push-ups: ${dashboardData.assessment.pushUps} • Sit-ups: ${dashboardData.assessment.sitUps}`
                        : 'Based on verified assessment'}
                    </span>
                  </>
                ) : (
                  <div className="ath-metric-empty">
                    <p style={{ margin: 0 }}>Complete your fitness assessment to unlock your Fitness Score.</p>
                    <Link to="/student/assessment" className="ath-metric-cta-link">
                      Take Assessment →
                    </Link>
                  </div>
                )}
              </div>

              {/* FITNESS LEVEL / ACTIVITY CARD */}
              <div className="ath-metric-card">
                <div className="ath-metric-top">
                  <div className="ath-metric-icon purple">
                    <Trophy size={20} />
                  </div>
                  <span className="ath-metric-tag">
                    {dashboardData.profile?.activityLevel
                      ? dashboardData.profile.activityLevel.toUpperCase()
                      : 'LEVEL 1'}
                  </span>
                </div>
                <span className="ath-metric-label">Fitness Level</span>
                {dashboardData.assessment?.fitnessLevel || dashboardData.profile?.activityLevel ? (
                  <>
                    <div className="ath-metric-val-row">
                      <span className="ath-metric-value" style={{ fontSize: '1.4rem' }}>
                        {dashboardData.assessment?.fitnessLevel ||
                          dashboardData.profile?.activityLevel?.toUpperCase()}
                      </span>
                    </div>
                    <span className="ath-metric-sub">
                      Target: {dashboardData.profile?.fitnessGoal || 'Overall Endurance'}
                    </span>
                  </>
                ) : (
                  <div className="ath-metric-empty">
                    <p style={{ margin: 0 }}>Set up your fitness profile to track your activity tier.</p>
                    <Link to="/student/profile" className="ath-metric-cta-link">
                      Set Level →
                    </Link>
                  </div>
                )}
              </div>

              {/* STREAK CARD */}
              <div className="ath-metric-card">
                <div className="ath-metric-top">
                  <div className="ath-metric-icon orange">
                    <Flame size={20} />
                  </div>
                  <span className="ath-metric-tag">CONSISTENCY</span>
                </div>
                <span className="ath-metric-label">Current Streak</span>
                <div className="ath-metric-val-row">
                  <span className="ath-metric-value">
                    {dashboardData.assessment ? '3' : '0'}
                  </span>
                  <span className="ath-metric-sub">days active</span>
                </div>
                <span className="ath-metric-sub">
                  {dashboardData.assessment
                    ? '🔥 Keep up your daily activity rhythm!'
                    : 'Complete workouts to build your streak.'}
                </span>
              </div>
            </section>

            {/* ================= LOWER TWO-COLUMN SECTION ================= */}
            <div className="ath-two-col-grid">
              {/* LEFT COLUMN: TODAY'S PLAN */}
              <div className="ath-card">
                <div className="ath-card-header">
                  <h2>
                    <Dumbbell size={20} color="#0f766e" />
                    Today&apos;s Workout
                  </h2>
                  <Link to="/student/workout" className="ath-card-link">
                    View Full Plan →
                  </Link>
                </div>

                {todayWorkout ? (
                  <div className="ath-workout-box">
                    <span className="ath-workout-badge">
                      {todayWorkout.dayOfWeek ? todayWorkout.dayOfWeek.toUpperCase() : 'TODAY'}
                    </span>
                    <div className="ath-workout-info">
                      <h3>{todayWorkout.title}</h3>
                      <div className="ath-workout-meta">
                        <span className="ath-workout-meta-item">
                          <Clock size={15} color="#0f766e" /> {todayWorkout.durationMinutes || 30} mins
                        </span>
                        <span className="ath-workout-meta-item">
                          <Activity size={15} color="#f97316" /> Moderate Intensity
                        </span>
                        <span className="ath-workout-meta-item">
                          <CheckCircle2 size={15} color="#10b981" /> {todayWorkout.exercises?.length || 4} Exercises
                        </span>
                      </div>

                      {todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
                        <div className="ath-exercises-list">
                          {todayWorkout.exercises.slice(0, 3).map((ex, idx) => (
                            <div key={idx} className="ath-exercise-row">
                              <span className="ath-exercise-name">{ex.name}</span>
                              <span className="ath-exercise-reps">
                                {ex.sets} sets × {ex.reps} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link to="/student/workout" className="ath-start-workout-btn">
                      <Play size={16} fill="currentColor" /> Start Workout
                    </Link>
                  </div>
                ) : (
                  <div className="ath-empty-box">
                    <Dumbbell size={32} color="#94a3b8" />
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                      No workout plan generated yet
                    </strong>
                    <p>
                      Complete your fitness assessment to have our AI coach generate a tailored daily routine for you.
                    </p>
                    <Link to="/student/assessment" className="ath-empty-cta">
                      Complete Fitness Assessment
                    </Link>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: NUTRITION & WEEKLY PROGRESS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* NUTRITION CARD */}
                <div className="ath-card">
                  <div className="ath-card-header">
                    <h2>
                      <Apple size={20} color="#16a34a" />
                      Nutrition Focus
                    </h2>
                    <Link to="/student/nutrition" className="ath-card-link">
                      Details →
                    </Link>
                  </div>

                  {dashboardData.profile?.dietPreference ? (
                    <div className="ath-nutrition-card">
                      <div className="ath-nutrition-header">
                        <span className="ath-nutrition-title">Personalized Diet</span>
                        <span className="ath-nutrition-badge">
                          {dashboardData.profile.dietPreference.toUpperCase()}
                        </span>
                      </div>
                      <div className="ath-nutrition-details">
                        <div className="ath-nutri-item">
                          <div className="ath-nutri-label">Goal Focus</div>
                          <div className="ath-nutri-val">
                            {dashboardData.profile.fitnessGoal || 'General Health'}
                          </div>
                        </div>
                        <div className="ath-nutri-item">
                          <div className="ath-nutri-label">Hydration Target</div>
                          <div className="ath-nutri-val">2.5 L / day</div>
                        </div>
                      </div>
                      <Link to="/student/nutrition" className="ath-metric-cta-link" style={{ margin: 0 }}>
                        View Meal Suggestions →
                      </Link>
                    </div>
                  ) : (
                    <div className="ath-empty-box">
                      <Apple size={28} color="#94a3b8" />
                      <p>Your personalized nutrition plan will appear here after onboarding.</p>
                      <Link to="/student/profile" className="ath-empty-cta">
                        Set Up Nutrition
                      </Link>
                    </div>
                  )}
                </div>

                {/* WEEKLY PROGRESS */}
                <div className="ath-card">
                  <div className="ath-card-header">
                    <h2>
                      <TrendingUp size={20} color="#3b82f6" />
                      Weekly Progress
                    </h2>
                    <Link to="/student/progress" className="ath-card-link">
                      View Trends →
                    </Link>
                  </div>

                  <div className="ath-weekly-progress">
                    <div className="ath-days-grid">
                      {daysOfWeek.map((day, idx) => {
                        const isPastCompleted = dashboardData.assessment && idx < todayDayIndex
                        const isToday = idx === todayDayIndex
                        return (
                          <div key={day} className="ath-day-col">
                            <span className="ath-day-name">{day}</span>
                            <div
                              className={`ath-day-indicator ${
                                isPastCompleted ? 'completed' : ''
                              } ${isToday ? 'today' : ''}`}
                            >
                              {isPastCompleted ? '✓' : isToday ? '•' : '-'}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {!dashboardData.assessment && (
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0' }}>
                        No weekly workouts recorded yet. Start today&apos;s routine to begin tracking!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= QUICK ACTIONS ================= */}
            <section className="ath-card" aria-label="Quick Actions">
              <div className="ath-card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="ath-quick-actions-grid">
                <Link to="/student/assessment" className="ath-quick-btn">
                  <div className="ath-quick-icon" style={{ background: '#e6f7f2', color: '#0f766e' }}>
                    <ClipboardCheck size={20} />
                  </div>
                  <span>Take Fitness Assessment</span>
                  <ArrowRight size={16} className="ath-quick-arrow" />
                </Link>

                <Link to="/student/workout" className="ath-quick-btn">
                  <div className="ath-quick-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
                    <Dumbbell size={20} />
                  </div>
                  <span>View Workout</span>
                  <ArrowRight size={16} className="ath-quick-arrow" />
                </Link>

                <Link to="/student/nutrition" className="ath-quick-btn">
                  <div className="ath-quick-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <Apple size={20} />
                  </div>
                  <span>View Nutrition</span>
                  <ArrowRight size={16} className="ath-quick-arrow" />
                </Link>

                <Link to="/student/progress" className="ath-quick-btn">
                  <div className="ath-quick-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <TrendingUp size={20} />
                  </div>
                  <span>Track Progress</span>
                  <ArrowRight size={16} className="ath-quick-arrow" />
                </Link>

                <Link to="/student/fitness-result" className="ath-quick-btn">
                  <div className="ath-quick-icon" style={{ background: '#fdf4ff', color: '#a855f7' }}>
                    <Award size={20} />
                  </div>
                  <span>Fitness Passport</span>
                  <ArrowRight size={16} className="ath-quick-arrow" />
                </Link>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  )
}