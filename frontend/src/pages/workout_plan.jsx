import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Award,
  ChevronDown,
  Info,
  Droplets,
  Moon,
  Zap,
  Activity,
  Heart,
  ShieldCheck,
  X,
  PlayCircle,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api.js'
import ExerciseTutorial from '../components/ExerciseTutorial.jsx'
import './workout_plan.css'

const COMMUNITY_ACTIVITY_OPTIONS = [
  'Mostly sedentary',
  'Mostly walking',
  'Farming / agricultural work',
  'Fishing / coastal work',
  'Manual / physical work',
  'Household / active work',
  'Mixed activity',
  'Other',
]

const GOAL_OPTIONS = [
  'General Fitness',
  'Strength',
  'Endurance',
  'Flexibility',
  'Weight Management',
  'Sports Performance',
]

const TIME_OPTIONS = [15, 25, 30, 45, 60]

export default function WorkoutPlan() {
  const { user } = useAuth()
  const isCommunity = user?.role === 'community'

  // Data State
  const [plan, setPlan] = useState(null)
  const [hasAssessment, setHasAssessment] = useState(true)
  const [assessmentSummary, setAssessmentSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [error, setError] = useState(null)
  const [pointsToast, setPointsToast] = useState(null)
  const [tutorialExercise, setTutorialExercise] = useState(null)

  // Tabs
  const [activeTab, setActiveTab] = useState('Weekly Plan')
  const [selectedDayFilter, setSelectedDayFilter] = useState('all')

  // Update Plan Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    goal: 'General Fitness',
    fitnessLevel: 'beginner',
    availableTimeMinutes: 30,
    dailyActivityContext: 'Farming / agricultural work',
  })
  const [regenerating, setRegenerating] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  // Load Active Plan
  const loadPlan = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest('/student/workout-plan')
      if (data?.plan) {
        setPlan(data.plan)
        setHasAssessment(Boolean(data.hasAssessment))
        setAssessmentSummary(data.assessmentSummary || null)
        setUpdateForm({
          goal: data.plan.goal || 'General Fitness',
          fitnessLevel: data.plan.fitnessLevel || 'beginner',
          availableTimeMinutes: data.plan.availableTimeMinutes || 30,
          dailyActivityContext: data.plan.dailyActivityContext || (isCommunity ? 'Farming / agricultural work' : ''),
        })
      }
    } catch (err) {
      console.error('Failed to load workout plan:', err)
      setError(err.message || 'Unable to load workout plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlan()
  }, [])

  // Toggle Exercise Completion
  const handleToggleExercise = async (dayOfWeek, exercise) => {
    setTogglingId(exercise.id)
    try {
      const res = await apiRequest('/student/workout-plan/activity/toggle', {
        method: 'POST',
        body: JSON.stringify({
          dayOfWeek,
          exerciseId: exercise.id,
          isCompleted: !exercise.isCompleted,
        }),
      })

      if (res?.plan) {
        setPlan(res.plan)
        if (res.pointsAwarded && !exercise.isCompleted) {
          setPointsToast(`+${res.pointsAwarded} XP earned! Keep up the momentum.`)
          setTimeout(() => setPointsToast(null), 4000)
        }
      }
    } catch (err) {
      alert(err.message || 'Could not update exercise completion.')
    } finally {
      setTogglingId(null)
    }
  }

  // Handle Regenerate Plan
  const handleRegeneratePlan = async (e) => {
    e.preventDefault()
    setRegenerating(true)
    setUpdateError(null)

    try {
      const res = await apiRequest('/student/workout-plan/generate', {
        method: 'POST',
        body: JSON.stringify({
          goal: updateForm.goal,
          fitnessLevel: updateForm.fitnessLevel,
          availableTimeMinutes: Number(updateForm.availableTimeMinutes),
          dailyActivityContext: isCommunity ? updateForm.dailyActivityContext : '',
        }),
      })

      if (res?.plan) {
        setPlan(res.plan)
        setShowUpdateModal(false)
        setPointsToast('Workout plan updated and recalibrated successfully!')
        setTimeout(() => setPointsToast(null), 4500)
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update workout plan. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  // Filtered workouts
  const displayWorkouts = plan?.workouts
    ? selectedDayFilter === 'all'
      ? plan.workouts
      : plan.workouts.filter((w) => w.dayOfWeek === selectedDayFilter)
    : []

  const totalExercises = plan?.totalActivitiesCount || 0
  const completedExercises = plan?.completedActivitiesCount || 0
  const completionPercentage = plan?.weeklyCompletionPercentage || 0

  return (
    <StudentAppLayout
      eyebrow={isCommunity ? 'COMMUNITY FUNCTIONAL MOVEMENT' : 'DAILY TRAINING & CONDITIONING'}
      pageTitle="Workout Plan"
      pageSubtitle={
        isCommunity
          ? 'Occupational movement & everyday recovery.'
          : 'Adaptive daily training calibrated to baseline test.'
      }
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
          <button
            type="button"
            className="ath-btn ath-btn-primary"
            onClick={() => {
              setUpdateError(null)
              setShowUpdateModal(true)
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '36px', padding: '0 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <Sliders size={14} /> Update Plan
          </button>
          <Link
            to="/student/custom-workout"
            className="ath-btn ath-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '36px', padding: '0 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          >
            <Dumbbell size={14} /> Custom Plan
          </Link>
          <button
            type="button"
            className="ath-btn ath-btn-secondary"
            onClick={loadPlan}
            disabled={loading}
            title="Refresh plan"
            aria-label="Refresh workout plan"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', minWidth: '36px', padding: 0 }}
          >
            <RefreshCw size={14} className={loading ? 'ath-spin' : ''} />
          </button>
        </div>
      }
    >
      {/* POINTS TOAST NOTIFICATION */}
      {pointsToast && (
        <div
          className="ath-card"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 100%)',
            color: '#ffffff',
            padding: '14px 20px',
            marginBottom: '18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#fef08a" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{pointsToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPointsToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* MISSING ASSESSMENT BANNER (STUDENT ONLY) */}
      {!isCommunity && !hasAssessment && (
        <div
          className="ath-card"
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '20px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#d97706" />
            <div>
              <div style={{ fontWeight: 750, color: '#92400e', fontSize: '0.95rem' }}>
                Complete your Fitness Assessment to get a more personalized workout plan.
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#b45309' }}>
                Record your push-ups, run times, and flexibility to unlock AI-calibrated progression.
              </p>
            </div>
          </div>
          <Link
            to="/student/assessment"
            className="ath-btn ath-btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Complete Assessment <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* COMMUNITY OCCUPATIONAL CONTEXT HERO BANNER */}
      {isCommunity && (
        <div
          className="ath-card"
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            color: '#ffffff',
            padding: '24px 28px',
            borderRadius: '20px',
            marginBottom: '22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={14} /> OCCUPATIONAL WELLNESS PROTOCOL
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                Active Context: {plan?.dailyActivityContext || updateForm.dailyActivityContext || 'General Activity'}
              </h2>
              <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem', maxWidth: '680px', lineHeight: 1.55 }}>
                Your plan is tailored to avoid heavy fatigue on top of strenuous daily work. It emphasizes spinal decompression,
                rotator cuff mobility, posture realignment, and active recovery routines.
              </p>
            </div>

            <button
              type="button"
              className="ath-btn"
              onClick={() => setShowUpdateModal(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 14px',
                fontSize: '0.82rem',
              }}
            >
              Change Work Context
            </button>
          </div>
        </div>
      )}

      {/* WEEKLY COMPLETION METRICS CARD */}
      <div className="ath-card" style={{ padding: '20px 24px', marginBottom: '22px', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ath-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Weekly Consistency & Completion
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ath-dark, #0f172a)', marginTop: '2px' }}>
              {completedExercises} of {totalExercises} Activities Completed ({completionPercentage}%)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="ath-badge success" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              🎯 Target: {plan?.goal || 'General Fitness'}
            </span>
            <span className="ath-badge info" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              ⏱ {plan?.availableTimeMinutes || 30} min/day
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #0f766e 100%)',
              borderRadius: '8px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="ath-tabs" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Weekly Plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('Weekly Plan')}
        >
          Weekly Schedule
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Exercise Directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('Exercise Directory')}
        >
          Exercise Directory
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Recovery & Tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('Recovery & Tips')}
        >
          Recovery & Mobility Tips
        </button>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="ath-card" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '16px 20px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="ath-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={28} className="ath-spin" style={{ margin: '0 auto 12px' }} color="#0f766e" />
          <p style={{ margin: 0 }}>Loading your personalized workout plan...</p>
        </div>
      )}

      {/* TAB 1: WEEKLY PLAN */}
      {!loading && activeTab === 'Weekly Plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* DAY FILTER PILLS */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
            <button
              type="button"
              className={`ath-badge ${selectedDayFilter === 'all' ? 'success' : ''}`}
              onClick={() => setSelectedDayFilter('all')}
              style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.82rem' }}
            >
              All 7 Days
            </button>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <button
                key={day}
                type="button"
                className={`ath-badge ${selectedDayFilter === day ? 'success' : ''}`}
                onClick={() => setSelectedDayFilter(day)}
                style={{
                  cursor: 'pointer',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  textTransform: 'capitalize',
                  background: selectedDayFilter === day ? '#0f766e' : '#f1f5f9',
                  color: selectedDayFilter === day ? '#ffffff' : '#475569',
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* DAYS LIST */}
          {displayWorkouts.map((dayPlan) => {
            const dayDoneCount = (dayPlan.exercises || []).filter((e) => e.isCompleted).length
            const dayTotalCount = (dayPlan.exercises || []).length
            const isDayAllDone = dayTotalCount > 0 && dayDoneCount === dayTotalCount

            return (
              <div
                key={dayPlan.dayOfWeek}
                className="ath-card"
                style={{
                  padding: '24px',
                  gap: '18px',
                  borderLeft: isDayAllDone ? '4px solid #10b981' : '4px solid #0f766e',
                }}
              >
                {/* DAY HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        className="ath-badge"
                        style={{
                          background: '#e6f7f2',
                          color: '#0f766e',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {dayPlan.dayOfWeek}
                      </span>
                      {dayPlan.focus && (
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                          Focus: {dayPlan.focus}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
                      {dayPlan.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={15} color="#0f766e" /> {dayPlan.durationMinutes || 30} min
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: isDayAllDone ? '#10b981' : '#64748b',
                      }}
                    >
                      {dayDoneCount}/{dayTotalCount} Completed
                    </span>
                  </div>
                </div>

                {/* EXERCISES UNDER THIS DAY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(dayPlan.exercises || []).map((exercise, exIdx) => {
                    const isToggling = togglingId === exercise.id
                    return (
                      <div
                        key={exercise.id || exIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 18px',
                          borderRadius: '12px',
                          background: exercise.isCompleted ? '#f0fdf4' : '#f8fafc',
                          border: exercise.isCompleted ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          flexWrap: 'wrap',
                          gap: '14px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleExercise(dayPlan.dayOfWeek, exercise)}
                            disabled={isToggling}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              color: exercise.isCompleted ? '#10b981' : '#94a3b8',
                              marginTop: '2px',
                              flexShrink: 0,
                            }}
                            title={exercise.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {exercise.isCompleted ? (
                              <CheckCircle2 size={24} fill="#10b981" color="#ffffff" />
                            ) : (
                              <Circle size={24} />
                            )}
                          </button>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h4
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: 750,
                                  color: exercise.isCompleted ? '#166534' : '#0f172a',
                                  margin: 0,
                                  textDecoration: exercise.isCompleted ? 'line-through' : 'none',
                                }}
                              >
                                {exercise.name}
                              </h4>
                              <span className="ath-badge" style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569' }}>
                                {exercise.category}
                              </span>
                              <span className="ath-badge info" style={{ fontSize: '0.72rem' }}>
                                {exercise.difficulty}
                              </span>
                            </div>

                            {/* Sets / Reps / Duration */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem', color: '#0f766e', fontWeight: 700, margin: '4px 0' }}>
                              {exercise.duration ? (
                                <span>⏱ {exercise.duration}</span>
                              ) : (
                                <span>{exercise.sets} sets × {exercise.reps} reps</span>
                              )}
                              {exercise.restSeconds > 0 && (
                                <span style={{ color: '#64748b', fontWeight: 500 }}>
                                  • {exercise.restSeconds}s rest
                                </span>
                              )}
                            </div>

                            {/* Short Instructions */}
                            {exercise.instructions && (
                              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                                {exercise.instructions}
                              </p>
                            )}

                            <button
                              type="button"
                              className="exercise-tutorial-link"
                              onClick={() => setTutorialExercise(exercise)}
                            >
                              <PlayCircle size={15} /> How to
                            </button>
                          </div>
                        </div>

                        {/* Completion Button */}
                        <button
                          type="button"
                          className={`ath-btn ${exercise.isCompleted ? 'ath-btn-secondary' : 'ath-btn-primary'}`}
                          onClick={() => handleToggleExercise(dayPlan.dayOfWeek, exercise)}
                          disabled={isToggling}
                          style={{
                            minWidth: '135px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          {isToggling ? (
                            <RefreshCw size={14} className="ath-spin" />
                          ) : exercise.isCompleted ? (
                            <>
                              <CheckCircle2 size={15} color="#10b981" /> Completed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={15} /> Mark Complete
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: EXERCISE DIRECTORY */}
      {!loading && activeTab === 'Exercise Directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {(plan?.workouts || []).flatMap((w) =>
            (w.exercises || []).map((ex) => (
              <div key={`${w.dayOfWeek}-${ex.id}`} className="ath-card" style={{ gap: '10px', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="ath-badge" style={{ textTransform: 'capitalize' }}>{w.dayOfWeek}</span>
                    <span className="ath-badge info">{ex.category}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--ath-dark, #0f172a)', margin: '4px 0' }}>
                    {ex.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ath-primary, #0f766e)', fontWeight: 750, margin: '2px 0 8px' }}>
                    {ex.duration ? ex.duration : `${ex.sets} sets × ${ex.reps} reps`}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ath-text-muted, #64748b)', margin: 0, lineHeight: 1.45 }}>
                    {ex.instructions || 'Focus on controlled breathing and full range of motion.'}
                  </p>
                  <button type="button" className="exercise-tutorial-link" onClick={() => setTutorialExercise(ex)}>
                    <PlayCircle size={15} /> How to perform
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--ath-border, #f1f5f9)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ath-text-light, #94a3b8)' }}>{ex.equipment || 'Bodyweight'}</span>
                  <span className={`ath-badge ${ex.isCompleted ? 'success' : ''}`}>
                    {ex.isCompleted ? 'Completed ✓' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: RECOVERY & MOBILITY TIPS */}
      {!loading && activeTab === 'Recovery & Tips' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Hydration Discipline</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Drink 300–500ml of clean water 30 minutes before physical work or workouts. Adequate cellular hydration prevents muscle cramps and joint fatigue.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f7f2', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Spinal Decompression</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Spend 3 minutes each evening in Child's Pose or gentle knee-to-chest holds to relieve gravitational disc compression from standing, walking, or lifting.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Restorative Sleep</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Physical adaptations and joint repair occur during deep stage-3 sleep. Prioritize 7 to 9 hours of restorative sleep in a dark, quiet room.
            </p>
          </div>
        </div>
      )}

      {tutorialExercise && (
        <ExerciseTutorial exercise={tutorialExercise} onClose={() => setTutorialExercise(null)} />
      )}

      {/* UPDATE / REGENERATE PLAN MODAL */}
      {showUpdateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !regenerating) setShowUpdateModal(false)
          }}
        >
          <div
            className="ath-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'var(--ath-card-bg, #ffffff)',
              border: '1px solid var(--ath-border, #e2e8f0)',
              borderRadius: '20px',
              padding: '28px',
              gap: '18px',
              boxShadow: '0 20px 48px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--ath-primary-light, #e6f7f2)', color: 'var(--ath-primary, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--ath-dark, #0f172a)' }}>
                    Update Workout Plan
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ath-text-muted, #64748b)' }}>
                    Recalibrate your weekly routine and physical parameters
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                disabled={regenerating}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ath-text-muted, #94a3b8)' }}
              >
                <X size={20} />
              </button>
            </div>

            {updateError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.84rem' }}>
                {updateError}
              </div>
            )}

            <form onSubmit={handleRegeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* PRIMARY GOAL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ath-text, #334155)', marginBottom: '6px' }}>
                  Primary Fitness Goal
                </label>
                <select
                  value={updateForm.goal}
                  onChange={(e) => setUpdateForm({ ...updateForm, goal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--ath-border, #cbd5e1)',
                    fontSize: '0.9rem',
                    background: 'var(--ath-input-bg, #ffffff)',
                    color: 'var(--ath-dark, #0f172a)',
                  }}
                >
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* FITNESS LEVEL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ath-text, #334155)', marginBottom: '6px' }}>
                  Current Fitness Level
                </label>
                <select
                  value={updateForm.fitnessLevel}
                  onChange={(e) => setUpdateForm({ ...updateForm, fitnessLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--ath-border, #cbd5e1)',
                    fontSize: '0.9rem',
                    background: 'var(--ath-input-bg, #ffffff)',
                    color: 'var(--ath-dark, #0f172a)',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* AVAILABLE DAILY TIME */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ath-text, #334155)', marginBottom: '6px' }}>
                  Available Time per Session
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setUpdateForm({ ...updateForm, availableTimeMinutes: t })}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: updateForm.availableTimeMinutes === t ? '2px solid var(--ath-primary, #0f766e)' : '1px solid var(--ath-border, #cbd5e1)',
                        background: updateForm.availableTimeMinutes === t ? 'var(--ath-primary-light, #e6f7f2)' : 'var(--ath-input-bg, #ffffff)',
                        color: updateForm.availableTimeMinutes === t ? 'var(--ath-primary, #0f766e)' : 'var(--ath-text, #475569)',
                        fontWeight: updateForm.availableTimeMinutes === t ? 750 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {t} min
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMUNITY DAILY ACTIVITY CONTEXT */}
              {isCommunity && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ath-text, #334155)', marginBottom: '6px' }}>
                    Daily Physical Activity / Work Context
                  </label>
                  <select
                    value={updateForm.dailyActivityContext}
                    onChange={(e) => setUpdateForm({ ...updateForm, dailyActivityContext: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--ath-border, #cbd5e1)',
                      fontSize: '0.9rem',
                      background: 'var(--ath-input-bg, #ffffff)',
                      color: 'var(--ath-dark, #0f172a)',
                    }}
                  >
                    {COMMUNITY_ACTIVITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--ath-text-muted, #64748b)' }}>
                    Workouts are automatically calibrated to avoid extra fatigue on top of your daily work routine.
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="ath-btn ath-btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={regenerating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ath-btn ath-btn-primary"
                  disabled={regenerating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {regenerating ? (
                    <>
                      <RefreshCw size={15} className="ath-spin" /> Recalibrating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> Regenerate Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}