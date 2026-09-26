import { useEffect, useState } from 'react'
import { CheckCircle2, Dumbbell, History, Save, Sparkles } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './PlanBuilders.css'

const sampleSplit = `Monday | Push strength | Push-ups; Pike push-ups; Tricep dips
Tuesday | Lower body | Squats; Reverse lunges; Glute bridges
Thursday | Pull and posture | Backpack rows; Superman holds; Plank
Saturday | Mobility and conditioning | Brisk walk; Hip mobility flow; Dead bug`

function parseSplit(text) {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [day, focus, exerciseText] = line.split('|').map((part) => part.trim())
    return {
      dayOfWeek: (day || 'monday').toLowerCase(),
      focus: focus || 'General fitness',
      title: focus || 'Custom workout',
      durationMinutes: 30,
      exercises: (exerciseText || 'Movement practice').split(';').map((name) => ({
        name: name.trim(), category: 'Strength', sets: 3, reps: 10, difficulty: 'Beginner', instructions: 'Use controlled form and stop if movement becomes painful.', restSeconds: 45, equipment: 'bodyweight',
      })).filter((exercise) => exercise.name),
    }
  }).filter((workout) => workout.exercises.length > 0)
}

export default function CustomWorkoutPlan() {
  const [goal, setGoal] = useState('General fitness')
  const [fitnessLevel, setFitnessLevel] = useState('beginner')
  const [split, setSplit] = useState(sampleSplit)
  const [history, setHistory] = useState([])
  const [activities, setActivities] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiRequest('/student/workout-plan/history'),
      apiRequest('/student/workout-plan/activity-history?period=week'),
    ]).then(([plansResponse, activityResponse]) => {
      setHistory(plansResponse.plans || [])
      setActivities(activityResponse.activities || [])
    }).catch(() => {})
  }, [])

  const savePlan = async (event) => {
    event.preventDefault()
    const workouts = parseSplit(split)
    if (workouts.length === 0) {
      setError('Add at least one valid split line.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await apiRequest('/student/workout-plan', { method: 'POST', body: { source: 'self_created', goal, fitnessLevel, availableTimeMinutes: 30, workouts } })
      setHistory((current) => [response.plan, ...current])
      setMessage('Custom workout split saved and made active.')
    } catch (err) {
      setError(err.message || 'Could not save workout split.')
    } finally {
      setSaving(false)
    }
  }

  return <StudentAppLayout pageTitle="Custom Workout Plans" pageSubtitle="Build and save your own weekly split" eyebrow="FITNESS PLAN BUILDER">
    <div className="builder-page">
      <section className="builder-hero"><div className="builder-hero-icon"><Dumbbell size={24} /></div><div><p>YOUR TRAINING STRUCTURE</p><h2>Make the plan fit your week.</h2><span>Use bodyweight, gym equipment, calisthenics, yoga, or any combination. The saved plan appears in your Workout Plan area.</span></div></section>
      <div className="builder-grid">
        <form className="builder-panel" onSubmit={savePlan}>
          <div className="builder-heading"><h3><Sparkles size={18} /> Create a custom split</h3></div>
          <label>Goal<input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Strength, mobility, sport performance..." /></label>
          <label>Fitness level<select value={fitnessLevel} onChange={(event) => setFitnessLevel(event.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          <label>Weekly split <span>One line per workout day</span><textarea value={split} onChange={(event) => setSplit(event.target.value)} rows={11} /></label>
          <p className="builder-help">Format: <strong>Day | Focus | Exercise; Exercise; Exercise</strong></p>
          {message && <p className="builder-success"><CheckCircle2 size={16} /> {message}</p>}
          {error && <p className="builder-error">{error}</p>}
          <button type="submit" className="ath-btn ath-btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save custom plan'}</button>
        </form>
        <section className="builder-panel"><div className="builder-heading"><h3><History size={18} /> Saved workout history</h3></div>{history.length === 0 ? <p className="builder-muted">Your saved plans will appear here.</p> : <div className="history-list">{history.map((plan) => <article className="history-card" key={plan.id}><div><h4>{plan.goal}</h4><p>{plan.workouts?.length || 0} workout days · {plan.source === 'self_created' ? 'Custom' : 'Generated'}</p></div><span>{plan.status}</span></article>)}</div>}</section>
      </div>
      <section className="builder-panel activity-history-panel"><div className="builder-heading"><h3><CheckCircle2 size={18} /> Completed this week</h3></div>{activities.length === 0 ? <p className="builder-muted">Completed exercises from the last 7 days will appear here.</p> : <div className="history-list">{activities.map((activity) => <article className="history-card" key={activity.id}><div><h4>{activity.exerciseName}</h4><p>{activity.workoutTitle} · {new Date(activity.completedAt).toLocaleString()}</p></div><span>Done</span></article>)}</div>}</section>
    </div>
  </StudentAppLayout>
}