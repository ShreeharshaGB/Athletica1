import { useState } from 'react'
import { Play, Dumbbell, Clock, Flame, CheckCircle2, Droplets, Moon } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const workoutDays = [
  {
    day: 'Day 1',
    title: 'Full Body HIIT',
    duration: '20 min',
    level: 'Moderate',
    calories: '210 kcal',
    exercises: ['Jumping Jacks', 'Push-ups', 'High Knees', 'Mountain Climbers'],
  },
  {
    day: 'Day 2',
    title: 'Lower Body Strength',
    duration: '25 min',
    level: 'Moderate',
    calories: '240 kcal',
    exercises: ['Bodyweight Squats', 'Walking Lunges', 'Glute Bridges', 'Calf Raises'],
  },
  {
    day: 'Day 3',
    title: 'Core & Stability',
    duration: '20 min',
    level: 'Easy',
    calories: '160 kcal',
    exercises: ['Plank Hold', 'Bicycle Crunches', 'Russian Twists', 'Bird Dogs'],
  },
  {
    day: 'Day 4',
    title: 'Upper Body Strength',
    duration: '25 min',
    level: 'Moderate',
    calories: '230 kcal',
    exercises: ['Incline Push-ups', 'Chair Dips', 'Doorframe Rows', 'Arm Circles'],
  },
  {
    day: 'Day 5',
    title: 'Cardio & Endurance',
    duration: '30 min',
    level: 'Moderate',
    calories: '290 kcal',
    exercises: ['Brisk Shuttle Walk', 'Speed Skaters', 'Shadow Boxing', 'Cool Down Stretch'],
  },
]

export default function WorkoutPlan() {
  const [activeTab, setActiveTab] = useState('Weekly Plan')
  const [startedWorkout, setStartedWorkout] = useState(null)

  const handleStart = (workout) => {
    setStartedWorkout(workout.title)
    alert(`Starting ${workout.title}! Take your time and maintain good form.`)
  }

  return (
    <StudentAppLayout
      pageTitle="Your Personalized Workout Plan"
      pageSubtitle="Calibrated to your fitness assessment and physical stamina."
      eyebrow="DAILY TRAINING"
    >
      {/* TABS */}
      <div className="ath-tabs">
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Weekly Plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('Weekly Plan')}
        >
          Weekly Plan
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'All Workouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('All Workouts')}
        >
          All Workouts
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('Tips')}
        >
          Recovery & Tips
        </button>
      </div>

      {/* WEEKLY PLAN TAB */}
      {activeTab === 'Weekly Plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workoutDays.map((workout) => {
            const isStarted = startedWorkout === workout.title
            return (
              <div
                key={workout.day}
                className="ath-card"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#e6f7f2',
                      color: '#0f766e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Dumbbell size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="ath-badge warning">{workout.day.toUpperCase()}</span>
                      <span className="ath-badge success">{workout.level}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 4px' }}>
                      {workout.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} color="#0f766e" /> {workout.duration}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={14} color="#f97316" /> {workout.calories}
                      </span>
                      <span>{workout.exercises.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`ath-btn ${isStarted ? 'ath-btn-secondary' : 'ath-btn-primary'}`}
                  onClick={() => handleStart(workout)}
                  style={{ minWidth: '130px' }}
                >
                  {isStarted ? (
                    <>
                      <CheckCircle2 size={16} color="#10b981" /> In Progress
                    </>
                  ) : (
                    <>
                      <Play size={15} fill="currentColor" /> Start Workout
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ALL WORKOUTS TAB */}
      {activeTab === 'All Workouts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {workoutDays.map((w) => (
            <div key={w.day} className="ath-card" style={{ gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ath-badge">{w.day}</span>
                <span className="ath-badge info">{w.level}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {w.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                Target: {w.exercises.slice(0, 3).join(', ')}
              </p>
              <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span>⏱ {w.duration}</span>
                <span>🔥 {w.calories}</span>
              </div>
              <button
                type="button"
                className="ath-btn ath-btn-secondary"
                onClick={() => handleStart(w)}
                style={{ width: '100%' }}
              >
                <Play size={14} fill="currentColor" /> Start Session
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TIPS TAB */}
      {activeTab === 'Tips' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Hydration Discipline</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Drink 300–500ml of water 30 minutes before physical exertion to prevent muscle cramping and maintain energy.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Warm-Up Ritual</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Spend 3 to 5 minutes performing dynamic mobility stretches like arm rotations and high knees before high-intensity drills.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Rest & Sleep Quality</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Growth and muscular adaptation occur during deep rest. Aim for 7 to 9 hours of uninterrupted sleep each night.
            </p>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}