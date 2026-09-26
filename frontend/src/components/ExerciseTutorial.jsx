import { Camera, PlayCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ExerciseTutorial.css'

function getTutorialVariant(exercise) {
  const name = `${exercise?.name || ''} ${exercise?.category || ''}`.toLowerCase()
  if (/bench press|chest press|machine press|dumbbell press/.test(name)) return 'bench'
  if (/lat pulldown|pull-up|pull up|chin-up|chin up|seated row|cable row|barbell row|dumbbell row|face pull/.test(name)) return 'pull'
  if (/shoulder press|overhead press|military press|arnold press|lateral raise|front raise/.test(name)) return 'press'
  if (/bicep curl|hammer curl|tricep|pushdown|skull crusher|leg extension|leg curl|calf raise/.test(name)) return 'isolation'
  if (/leg press|hack squat|smith squat/.test(name)) return 'legpress'
  if (/deadlift|romanian|good morning|hip thrust|cable pull-through/.test(name)) return 'hinge'
  if (/squat|chair sit|wall sit/.test(name)) return 'squat'
  if (/push|press|plank|mountain climber|burpee/.test(name)) return 'push'
  if (/lunge|split squat|step-up|step up/.test(name)) return 'lunge'
  if (/yoga|child|cobra|cat-cow|stretch|mobility|flexib/.test(name)) return 'flow'
  if (/run|jump|skip|hop|jack|cardio|march/.test(name)) return 'cardio'
  if (/hinge|deadlift|bridge|good morning|glute/.test(name)) return 'hinge'
  return 'controlled'
}

function TutorialFigure({ variant }) {
  return (
    <div className={`tutorial-figure ${variant}`} aria-hidden="true">
      <div className="tutorial-head" />
      <div className="tutorial-torso" />
      <div className="tutorial-arm left" />
      <div className="tutorial-arm right" />
      <div className="tutorial-leg left" />
      <div className="tutorial-leg right" />
    </div>
  )
}

export default function ExerciseTutorial({ exercise, onClose }) {
  const navigate = useNavigate()
  if (!exercise) return null

  const variant = getTutorialVariant(exercise)
  const instruction = exercise.instructions || 'Move slowly, keep your breathing steady, and use a comfortable range of motion.'

  return (
    <div className="tutorial-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <header className="tutorial-header">
          <div>
            <span className="tutorial-kicker"><PlayCircle size={14} /> MOVEMENT TUTORIAL</span>
            <h2 id="tutorial-title">How to: {exercise.name}</h2>
          </div>
          <button type="button" className="tutorial-close" onClick={onClose} aria-label="Close tutorial">
            <X size={20} />
          </button>
        </header>

        <div className="tutorial-body">
          <div className="tutorial-stage">
            <TutorialFigure variant={variant} />
            <span className="tutorial-stage-label">Move slowly and repeat</span>
          </div>

          <div className="tutorial-details">
            <div className="tutorial-meta">
              <span>{exercise.duration || `${exercise.sets || 0} sets x ${exercise.reps || 0} reps`}</span>
              <span>{exercise.equipment || 'Bodyweight'}</span>
            </div>
            <h3>Form focus</h3>
            <p>{instruction}</p>
            <div className="tutorial-steps">
              <div><strong>1</strong><span>Set up with a stable base and comfortable range.</span></div>
              <div><strong>2</strong><span>Control the movement in both directions.</span></div>
              <div><strong>3</strong><span>Stop for sharp pain, dizziness, or loss of control.</span></div>
            </div>
            <p className="tutorial-note">This animation is a general visual cue. Follow the form instructions and choose the easier option if needed.</p>
            <button type="button" className="tutorial-form-button" onClick={() => navigate(`/student/form-check?exercise=${encodeURIComponent(exercise.name)}`)}>
              <Camera size={16} /> Check my form with camera
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}