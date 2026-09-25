import { useState } from 'react'
import {
  Users,
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Trophy,
  Gamepad2,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const students = [
  { name: 'Ananya S.', score: 82, date: 'Sep 21, 2026', status: 'Improving', tier: 'Top 10%' },
  { name: 'Diya K.', score: 76, date: 'Sep 20, 2026', status: 'Improving', tier: 'Above Average' },
  { name: 'Rohan M.', score: 69, date: 'Sep 19, 2026', status: 'On Track', tier: 'Developing' },
  { name: 'Karthik N.', score: 88, date: 'Sep 18, 2026', status: 'Exceptional', tier: 'Top 5%' },
]

const talentAreas = [
  { name: 'Sprinting & Explosive Power', value: 85, count: 12, icon: '⚡' },
  { name: 'Aerobic & Cardio Endurance', value: 78, count: 18, icon: '🏃' },
  { name: 'Flexibility & Joint Mobility', value: 72, count: 14, icon: '🧘' },
  { name: 'Coordination & Agility', value: 80, count: 10, icon: '🎯' },
]

export default function TeacherDashboard({
  onWorkoutPlan,
  onNutrition,
  onWellness,
  onProgress,
  onTalent,
  onGamification,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="ath-shell">
      {/* Mobile Backdrop */}
      <div
        className={`ath-sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* SIDEBAR */}
      <aside className={`ath-sidebar ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" className="ath-sidebar-brand" onClick={() => setMobileOpen(false)}>
          <div className="ath-brand-badge">
            A<span>+</span>
          </div>
          <div className="ath-brand-text">
            <h2>ATHLETICA</h2>
            <span>Coach & Educator</span>
          </div>
        </Link>

        <p className="ath-sidebar-menu-kicker">Faculty Portal</p>

        <nav className="ath-sidebar-nav">
          <button type="button" className="ath-nav-btn active">
            <div className="ath-nav-icon-wrap">
              <Users size={19} />
            </div>
            <span className="ath-nav-label">Class Cohorts</span>
          </button>
          <button type="button" onClick={onWorkoutPlan} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <Dumbbell size={19} />
            </div>
            <span className="ath-nav-label">Assigned Workouts</span>
          </button>
          <button type="button" onClick={onNutrition} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <Apple size={19} />
            </div>
            <span className="ath-nav-label">Student Fueling</span>
          </button>
          <button type="button" onClick={onWellness} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <HeartPulse size={19} />
            </div>
            <span className="ath-nav-label">Wellness Reports</span>
          </button>
          <button type="button" onClick={onProgress} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <TrendingUp size={19} />
            </div>
            <span className="ath-nav-label">Cohort Trends</span>
          </button>
          <button type="button" onClick={onTalent} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <Trophy size={19} />
            </div>
            <span className="ath-nav-label">Talent Scouting</span>
          </button>
          <button type="button" onClick={onGamification} className="ath-nav-btn">
            <div className="ath-nav-icon-wrap">
              <Gamepad2 size={19} />
            </div>
            <span className="ath-nav-label">School Leaderboard</span>
          </button>
        </nav>

        <div className="ath-sidebar-footer">
          <button
            type="button"
            className="ath-nav-btn"
            style={{ color: '#ef4444' }}
            onClick={onLogout}
          >
            <div className="ath-nav-icon-wrap">
              <LogOut size={19} />
            </div>
            <span className="ath-nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN SHELL */}
      <div className="ath-main-shell">
        <header className="ath-topbar">
          <div className="ath-topbar-left">
            <button
              className="ath-mobile-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ath-topbar-heading">
              <h1>Physical Education Dashboard</h1>
              <p>Section 9-B Athletic Cohort Overview</p>
            </div>
          </div>

          <div className="ath-topbar-right">
            <button
              className="ath-icon-btn"
              type="button"
              aria-label="Notifications"
              onClick={() => alert('No urgent fitness alerts.')}
            >
              <Bell size={18} />
              <span className="ath-notify-dot" />
            </button>

            <div className="ath-user-profile-btn">
              <div className="ath-avatar" style={{ background: '#3b82f6' }}>
                T
              </div>
              <div className="ath-user-meta">
                <span className="ath-user-name">Coach Sharma</span>
                <span className="ath-user-role" style={{ color: '#3b82f6' }}>Head of P.E.</span>
              </div>
            </div>
          </div>
        </header>

        <main className="ath-container">
          <div className="ath-eyebrow">COHORT OVERVIEW</div>

          {/* METRICS ROW */}
          <div className="ath-metrics-row">
            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon blue">
                  <Users size={20} />
                </div>
                <span className="ath-badge success">42 ENROLLED</span>
              </div>
              <div>
                <div className="ath-metric-label">Monitored Athletes</div>
                <div className="ath-metric-val">42</div>
              </div>
              <div className="ath-metric-subtext">Active student fitness logs</div>
            </div>

            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon teal">
                  <ClipboardCheck size={20} />
                </div>
                <span className="ath-badge success">+4% vs last month</span>
              </div>
              <div>
                <div className="ath-metric-label">Average Cohort Score</div>
                <div className="ath-metric-val">77.4<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span></div>
              </div>
              <div className="ath-metric-subtext">Class median fitness index</div>
            </div>

            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon purple">
                  <ShieldCheck size={20} />
                </div>
                <span className="ath-badge info">38 VERIFIED</span>
              </div>
              <div>
                <div className="ath-metric-label">Assessments Logged</div>
                <div className="ath-metric-val">90.5%</div>
              </div>
              <div className="ath-metric-subtext">38 of 42 completed testing</div>
            </div>

            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon orange">
                  <Trophy size={20} />
                </div>
                <span className="ath-badge">SCOUTING</span>
              </div>
              <div>
                <div className="ath-metric-label">Talents Flagged</div>
                <div className="ath-metric-val">8</div>
              </div>
              <div className="ath-metric-subtext">Recommended for district trials</div>
            </div>
          </div>

          {/* TWO-COLUMN: RECENT ASSESSMENTS + TALENT SCOUTING */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* STUDENTS TABLE */}
            <div className="ath-card" style={{ gap: '16px' }}>
              <div className="ath-card-header">
                <h2>
                  <Users size={20} color="#0f766e" />
                  Recent Student Assessments
                </h2>
                <span className="ath-badge">LATEST</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {students.map((student, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0f172a' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Tested {student.date} • {student.tier}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="ath-badge success">{student.status}</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f766e' }}>
                        {student.score}
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TALENT IDENTIFICATION BREAKDOWN */}
            <div className="ath-card" style={{ gap: '16px' }}>
              <div className="ath-card-header">
                <h2>
                  <Trophy size={20} color="#f59e0b" />
                  Cohort Aptitude Distribution
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {talentAreas.map((talent, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {talent.icon} {talent.name}
                      </span>
                      <span style={{ color: '#64748b' }}>{talent.count} athletes ({talent.value}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${talent.value}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #0f766e, #14b8a6)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}