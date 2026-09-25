import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import './StudentDashboard.css'

export default function StudentAssessment() {
  const navigate = useNavigate()
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
        navigate('/student/dashboard')
      }, 1500)
    } catch (err) {
      setFeedback(err.message || 'Unable to record assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '36px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', padding: '36px 32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e6f7f2', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Fitness Assessment
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
              Record your physical test results to calculate your verified Fitness Score.
            </p>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Assessment Saved!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Redirecting to your dashboard to view your new score...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Push-ups (reps in 1 min)
              </label>
              <input
                type="number"
                name="pushUps"
                value={formData.pushUps}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Sit-ups (reps in 1 min)
              </label>
              <input
                type="number"
                name="sitUps"
                value={formData.sitUps}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                50m Sprint Run Time (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                name="runTime"
                value={formData.runTime}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Sit and Reach Flexibility (cm)
              </label>
              <input
                type="number"
                name="flexibility"
                value={formData.flexibility}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                4x10m Shuttle Run (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                name="shuttleRun"
                value={formData.shuttleRun}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            {feedback && (
              <p style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                {feedback}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '14px',
                background: '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'Submitting Assessment...' : 'Submit Fitness Assessment'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
