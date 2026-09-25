import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import StudentAppLayout from '../components/StudentAppLayout'

export default function StudentAssessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    pushUps: '25',
    sitUps: '30',
    runTime: '12.5',
    flexibility: '18',
    shuttleRun: '11.2',
  })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFeedback('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback('')

    try {
      await apiRequest('/student/assessment', {
        method: 'POST',
        body: JSON.stringify({
          pushUps: Number(formData.pushUps),
          sitUps: Number(formData.sitUps),
          runTime: Number(formData.runTime),
          flexibility: Number(formData.flexibility),
          shuttleRun: Number(formData.shuttleRun),
        }),
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/student/fitness-result')
      }, 1500)
    } catch (err) {
      setFeedback(err.message || 'Unable to record assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentAppLayout
      pageTitle="Physical Fitness Assessment"
      pageSubtitle="Standardized physiological baseline tests to calculate your certified Fitness Score."
      eyebrow="FITNESS ASSESSMENT"
    >
      <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
        {/* STEPPER PROGRESS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              1
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: step === 1 ? '#0f766e' : '#64748b' }}>
              Muscular Endurance
            </span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step === 2 ? '#0f766e' : '#e2e8f0', margin: '0 16px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step === 2 ? '#0f766e' : '#e2e8f0',
                color: step === 2 ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              2
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: step === 2 ? '#0f766e' : '#64748b' }}>
              Speed & Flexibility
            </span>
          </div>
        </div>

        {success ? (
          <div className="ath-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Assessment Successfully Recorded!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Calculating your verified score and generating your digital Fitness Passport...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="ath-card" style={{ gap: '20px' }}>
                <div className="ath-card-header">
                  <h2>
                    <ClipboardCheck size={20} color="#0f766e" />
                    Section 1: Muscular Strength & Endurance
                  </h2>
                  <span className="ath-badge info">1 MINUTE TESTS</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div className="ath-form-group">
                    <label className="ath-label">Push-up Repetition Count</label>
                    <input
                      type="number"
                      name="pushUps"
                      className="ath-input"
                      value={formData.pushUps}
                      onChange={handleChange}
                      placeholder="e.g. 25"
                      min="0"
                      max="150"
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Continuous reps completed with full arm extension in 60s.</span>
                  </div>

                  <div className="ath-form-group">
                    <label className="ath-label">Sit-up Repetition Count</label>
                    <input
                      type="number"
                      name="sitUps"
                      className="ath-input"
                      value={formData.sitUps}
                      onChange={handleChange}
                      placeholder="e.g. 30"
                      min="0"
                      max="150"
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Full abdominal crunches completed in 60 seconds.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={() => setStep(2)}
                  >
                    Next: Speed & Flexibility <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ath-card" style={{ gap: '20px' }}>
                <div className="ath-card-header">
                  <h2>
                    <ClipboardCheck size={20} color="#0f766e" />
                    Section 2: Speed, Agility & Mobility
                  </h2>
                  <span className="ath-badge info">TRACK & FIELD TIMING</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div className="ath-form-group">
                    <label className="ath-label">50m Dash Sprint Time (seconds)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="runTime"
                      className="ath-input"
                      value={formData.runTime}
                      onChange={handleChange}
                      placeholder="e.g. 12.5"
                      min="4"
                      max="40"
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Electronic or stopwatch timing from standing start.</span>
                  </div>

                  <div className="ath-form-group">
                    <label className="ath-label">Sit and Reach Flexibility (cm)</label>
                    <input
                      type="number"
                      name="flexibility"
                      className="ath-input"
                      value={formData.flexibility}
                      onChange={handleChange}
                      placeholder="e.g. 18"
                      min="-20"
                      max="60"
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Centimeters reached past toes on standard test board.</span>
                  </div>

                  <div className="ath-form-group">
                    <label className="ath-label">4×10m Shuttle Agility Run (seconds)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="shuttleRun"
                      className="ath-input"
                      value={formData.shuttleRun}
                      onChange={handleChange}
                      placeholder="e.g. 11.2"
                      min="5"
                      max="35"
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Time taken to retrieve and place two blocks over 10m.</span>
                  </div>
                </div>

                {feedback && (
                  <p style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                    {feedback}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <button
                    type="submit"
                    className="ath-btn ath-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting Test Data...' : 'Submit & Calculate Score'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </StudentAppLayout>
  )
}
