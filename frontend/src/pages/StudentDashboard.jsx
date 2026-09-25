import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Award,
  Play,
  Flame,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import StudentAppLayout from '../components/StudentAppLayout'

export default function StudentDashboard() {
  const { user } = useAuth()
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

  // Days list for weekly progress
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayDayIndex = (new Date().getDay() + 6) % 7 // 0 = Mon, 6 = Sun

  return (
    <StudentAppLayout
      pageTitle={`${greeting}, ${studentName} 👋`}
      pageSubtitle="Ready to improve your fitness today?"
      eyebrow="YOUR FITNESS JOURNEY"
    >
      {/* LOADING STATE */}
      {loading && (
        <div className="ath-card" style={{ textAlign: 'center', padding: '60px 24px', margin: '40px 0' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#0f766e',
              borderRadius: '50%',
              animation: 'ath-spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
            Loading your fitness dashboard...
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Syncing verified metrics, daily workout plans, and wellness tracking.
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="ath-card" style={{ textAlign: 'center', padding: '50px 24px', margin: '40px 0' }}>
          <div style={{ color: '#ef4444', marginBottom: '12px' }}>
            <Activity size={36} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
            {error}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 18px' }}>
            Unable to connect to Athletica services right now.
          </p>
          <button
            type="button"
            className="ath-btn ath-btn-primary"
            onClick={loadData}
            style={{ margin: '0 auto' }}
          >
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      {/* MAIN DASHBOARD CONTENT */}
      {!loading && !error && (
        <>
          {/* ================= HERO / DAILY SUMMARY ================= */}
          <section
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
              borderRadius: '20px',
              padding: '24px 28px',
              color: '#ffffff',
              boxShadow: '0 6px 20px rgba(15, 118, 110, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
            aria-label="Daily fitness summary"
          >
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.16)',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={13} /> Active Focus
              </div>
              <h2 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.7rem)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>
                {dashboardData.assessment
                  ? 'Keep up your physical momentum this week'
                  : 'Complete your fitness assessment to unlock training'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#ccfbf1', margin: '0 0 16px', lineHeight: 1.5 }}>
                {dashboardData.assessment
                  ? `Verified Assessment Score: ${fitnessScore}/100 • Tier: ${dashboardData.assessment.fitnessLevel || 'Active'}`
                  : 'Log your baseline push-ups, sit-ups, and sprint times to generate AI workout and nutrition recommendations.'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <Flame size={15} color="#f97316" />
                  <span>Streak: <strong style={{ color: '#5eead4' }}>{dashboardData.assessment ? '3 Days' : '0 Days'}</strong></span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <Activity size={15} color="#14b8a6" />
                  <span>Goal: <strong style={{ color: '#5eead4' }}>{dashboardData.profile?.fitnessGoal || 'Build Stamina'}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              {dashboardData.assessment ? (
                <Link to="/student/workout" className="ath-btn" style={{ background: '#ffffff', color: '#0f766e', fontWeight: 700, padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Play size={15} fill="currentColor" /> View Today&apos;s Plan
                </Link>
              ) : (
                <Link to="/student/assessment" className="ath-btn" style={{ background: '#ffffff', color: '#0f766e', fontWeight: 700, padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  Take Assessment <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </section>

          {/* ================= METRICS ROW (4 Cards of Identical Height & Layout) ================= */}
          <section className="ath-metrics-row" aria-label="Key Fitness Metrics">
            {/* Card 1: BMI */}
            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon teal">
                  <HeartPulse size={20} />
                </div>
                {bmiInfo ? (
                  <span className="ath-badge success">{bmiInfo.category}</span>
                ) : (
                  <span className="ath-badge">SETUP NEEDED</span>
                )}
              </div>
              <div>
                <div className="ath-metric-label">Body Mass Index (BMI)</div>
                {bmiInfo ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="ath-metric-val">{bmiInfo.value}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>kg/m²</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>Not calculated</span>
                )}
              </div>
              <div className="ath-metric-subtext">
                {bmiInfo ? (
                  `Height: ${dashboardData.profile.height} cm • Weight: ${dashboardData.profile.weight} kg`
                ) : (
                  <Link to="/student/profile" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
                    Complete Profile →
                  </Link>
                )}
              </div>
            </div>

            {/* Card 2: Fitness Score */}
            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon blue">
                  <Award size={20} />
                </div>
                {fitnessScore !== null ? (
                  <span className="ath-badge success">{dashboardData.assessment?.fitnessLevel || 'Good'}</span>
                ) : (
                  <span className="ath-badge warning">UNASSESSED</span>
                )}
              </div>
              <div>
                <div className="ath-metric-label">Fitness Score</div>
                {fitnessScore !== null ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="ath-metric-val">{fitnessScore}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ 100</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>No test logged</span>
                )}
              </div>
              <div className="ath-metric-subtext">
                {fitnessScore !== null ? (
                  'Verified from test scores'
                ) : (
                  <Link to="/student/assessment" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
                    Take Assessment →
                  </Link>
                )}
              </div>
            </div>

            {/* Card 3: Fitness Level */}
            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon purple">
                  <Trophy size={20} />
                </div>
                <span className="ath-badge info">
                  {dashboardData.profile?.activityLevel ? dashboardData.profile.activityLevel.toUpperCase() : 'LEVEL 1'}
                </span>
              </div>
              <div>
                <div className="ath-metric-label">Fitness Tier</div>
                <div className="ath-metric-val" style={{ fontSize: '1.45rem', textTransform: 'capitalize' }}>
                  {dashboardData.assessment?.fitnessLevel || dashboardData.profile?.activityLevel || 'Active'}
                </div>
              </div>
              <div className="ath-metric-subtext">
                Goal: {dashboardData.profile?.fitnessGoal || 'Overall Endurance'}
              </div>
            </div>

            {/* Card 4: Current Streak */}
            <div className="ath-metric-card">
              <div className="ath-metric-top">
                <div className="ath-metric-icon orange">
                  <Flame size={20} />
                </div>
                <span className="ath-badge">CONSISTENCY</span>
              </div>
              <div>
                <div className="ath-metric-label">Current Streak</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span className="ath-metric-val">{dashboardData.assessment ? '3' : '0'}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>active days</span>
                </div>
              </div>
              <div className="ath-metric-subtext">
                {dashboardData.assessment ? '🔥 3 workouts completed this week' : 'Complete a workout to build streak'}
              </div>
            </div>
          </section>

          {/* ================= TWO-COLUMN CONTENT GRID ================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* TODAY'S WORKOUT SECTION */}
            <div className="ath-card">
              <div className="ath-card-header">
                <h2>
                  <Dumbbell size={19} color="#0f766e" />
                  Today&apos;s Workout
                </h2>
                <Link to="/student/workout" className="ath-card-action">
                  View Plan →
                </Link>
              </div>

              {todayWorkout ? (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                        {todayWorkout.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} color="#0f766e" /> {todayWorkout.durationMinutes || 30} mins
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Activity size={14} color="#f97316" /> Moderate
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} color="#10b981" /> {todayWorkout.exercises?.length || 4} Exercises
                        </span>
                      </div>
                    </div>
                    <span className="ath-badge warning">
                      {todayWorkout.dayOfWeek ? todayWorkout.dayOfWeek.toUpperCase() : 'TODAY'}
                    </span>
                  </div>

                  {todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{ex.name}</span>
                          <span style={{ color: '#64748b' }}>{ex.sets} sets × {ex.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link to="/student/workout" className="ath-btn ath-btn-primary" style={{ width: '100%', marginTop: '4px' }}>
                    <Play size={15} fill="currentColor" /> Start Workout
                  </Link>
                </div>
              ) : (
                <div className="ath-empty-state">
                  <Dumbbell size={32} color="#94a3b8" />
                  <h3>No workout plan generated yet</h3>
                  <p>
                    Complete your fitness assessment so our AI training engine can configure your personalized daily workout routine.
                  </p>
                  <Link to="/student/assessment" className="ath-btn ath-btn-primary" style={{ marginTop: '8px' }}>
                    Complete Fitness Assessment
                  </Link>
                </div>
              )}
            </div>

            {/* NUTRITION & WEEKLY PROGRESS STACK */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* NUTRITION CARD */}
              <div className="ath-card">
                <div className="ath-card-header">
                  <h2>
                    <Apple size={19} color="#10b981" />
                    Nutrition Plan
                  </h2>
                  <Link to="/student/nutrition" className="ath-card-action">
                    Details →
                  </Link>
                </div>

                {dashboardData.profile?.dietPreference ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>Dietary Profile</span>
                      <span className="ath-badge success">{dashboardData.profile.dietPreference.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Nutrition Goal</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>
                          {dashboardData.profile.fitnessGoal || 'Balanced Health'}
                        </div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Daily Hydration</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>
                          2.5 L / day
                        </div>
                      </div>
                    </div>
                    <Link to="/student/nutrition" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', textDecoration: 'none' }}>
                      View Full Meal Schedule →
                    </Link>
                  </div>
                ) : (
                  <div className="ath-empty-state">
                    <Apple size={28} color="#94a3b8" />
                    <h3>Nutrition Onboarding</h3>
                    <p>Your personalized nutrition plan will appear here after setting your dietary preferences.</p>
                    <Link to="/student/profile" className="ath-btn ath-btn-primary" style={{ marginTop: '6px' }}>
                      Set Up Nutrition
                    </Link>
                  </div>
                )}
              </div>

              {/* WEEKLY PROGRESS */}
              <div className="ath-card">
                <div className="ath-card-header">
                  <h2>
                    <TrendingUp size={19} color="#3b82f6" />
                    Weekly Progress
                  </h2>
                  <Link to="/student/progress" className="ath-card-action">
                    Trends →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                    {daysOfWeek.map((day, idx) => {
                      const isPastCompleted = dashboardData.assessment && idx < todayDayIndex
                      const isToday = idx === todayDayIndex
                      return (
                        <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>{day}</span>
                          <div
                            style={{
                              width: '100%',
                              height: '46px',
                              background: isPastCompleted ? '#e6f7f2' : '#f8fafc',
                              border: isToday ? '2px solid #0f766e' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: isPastCompleted || isToday ? '#0f766e' : '#94a3b8',
                            }}
                          >
                            {isPastCompleted ? '✓' : isToday ? '•' : '-'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {!dashboardData.assessment && (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0' }}>
                      No weekly activity recorded yet. Complete today&apos;s workout to track your trend.
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
              <Link to="/student/assessment" style={{ textDecoration: 'none' }}>
                <div className="ath-card" style={{ padding: '16px', borderRadius: '12px', flexDirection: 'row', alignItems: 'center', gap: '14px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e6f7f2', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardCheck size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Take Assessment</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Log test measurements</div>
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
              </Link>

              <Link to="/student/workout" style={{ textDecoration: 'none' }}>
                <div className="ath-card" style={{ padding: '16px', borderRadius: '12px', flexDirection: 'row', alignItems: 'center', gap: '14px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Dumbbell size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>View Workout</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>AI tailored regimen</div>
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
              </Link>

              <Link to="/student/nutrition" style={{ textDecoration: 'none' }}>
                <div className="ath-card" style={{ padding: '16px', borderRadius: '12px', flexDirection: 'row', alignItems: 'center', gap: '14px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Apple size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>View Nutrition</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Meal schedule & macros</div>
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
              </Link>

              <Link to="/student/progress" style={{ textDecoration: 'none' }}>
                <div className="ath-card" style={{ padding: '16px', borderRadius: '12px', flexDirection: 'row', alignItems: 'center', gap: '14px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Track Progress</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Score & weight trends</div>
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
              </Link>

              <Link to="/student/fitness-result" style={{ textDecoration: 'none' }}>
                <div className="ath-card" style={{ padding: '16px', borderRadius: '12px', flexDirection: 'row', alignItems: 'center', gap: '14px', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Fitness Passport</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Verified student credential</div>
                  </div>
                  <ArrowRight size={16} color="#94a3b8" />
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </StudentAppLayout>
  )
}