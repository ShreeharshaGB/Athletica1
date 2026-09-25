import { useState } from 'react'
import { HeartPulse, Moon, Droplets, Smile, Brain, CheckCircle2, Sparkles } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const moods = [
  { id: 'energized', label: 'Energized', icon: '⚡' },
  { id: 'calm', label: 'Calm', icon: '🌿' },
  { id: 'focused', label: 'Focused', icon: '🎯' },
  { id: 'tired', label: 'Tired', icon: '😴' },
]

export default function Wellness() {
  const [water, setWater] = useState('7')
  const [sleep, setSleep] = useState('8')
  const [meditation, setMeditation] = useState('15')
  const [selectedMood, setSelectedMood] = useState('calm')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    if (!water || !sleep) {
      alert('Please fill in water and sleep hours.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <StudentAppLayout
      pageTitle="Mind & Body Wellness"
      pageSubtitle="Holistic recovery, sleep rhythm tracking, and daily mental clarity check-ins."
      eyebrow="HOLISTIC WELLNESS"
    >
      {/* METRICS ROW */}
      <div className="ath-metrics-row">
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon teal">
              <Brain size={20} />
            </div>
            <span className="ath-badge success">EXCELLENT</span>
          </div>
          <div>
            <div className="ath-metric-label">Mental Clarity</div>
            <div className="ath-metric-val">88<span style={{ fontSize: '1rem', color: '#64748b' }}>/100</span></div>
          </div>
          <div className="ath-metric-subtext">Based on check-in frequency</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon purple">
              <Moon size={20} />
            </div>
            <span className="ath-badge info">OPTIMAL</span>
          </div>
          <div>
            <div className="ath-metric-label">Sleep Duration</div>
            <div className="ath-metric-val">{sleep} <span style={{ fontSize: '1rem', color: '#64748b' }}>hrs</span></div>
          </div>
          <div className="ath-metric-subtext">Recommended: 7–9 hrs</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon blue">
              <Droplets size={20} />
            </div>
            <span className="ath-badge success">ON TRACK</span>
          </div>
          <div>
            <div className="ath-metric-label">Hydration Target</div>
            <div className="ath-metric-val">{water} <span style={{ fontSize: '1rem', color: '#64748b' }}>glasses</span></div>
          </div>
          <div className="ath-metric-subtext">{(Number(water) * 0.25).toFixed(1)} L of water consumed</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon orange">
              <Sparkles size={20} />
            </div>
            <span className="ath-badge">ACTIVE</span>
          </div>
          <div>
            <div className="ath-metric-label">Mindful Minutes</div>
            <div className="ath-metric-val">{meditation} <span style={{ fontSize: '1rem', color: '#64748b' }}>mins</span></div>
          </div>
          <div className="ath-metric-subtext">Breathwork & mobility done</div>
        </div>
      </div>

      {/* TWO-COLUMN CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* CHECK-IN FORM */}
        <div className="ath-card">
          <div className="ath-card-header">
            <h2>
              <HeartPulse size={20} color="#0f766e" />
              Daily Wellness Check-In
            </h2>
            <span className="ath-badge">TODAY</span>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="ath-form-group">
              <label className="ath-label">How are you feeling right now?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {moods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: selectedMood === m.id ? '2px solid #0f766e' : '1px solid #e2e8f0',
                      background: selectedMood === m.id ? '#e6f7f2' : '#ffffff',
                      color: selectedMood === m.id ? '#0f766e' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="ath-form-group">
                <label className="ath-label">Sleep Hours (last night)</label>
                <input
                  type="number"
                  className="ath-input"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  min="3"
                  max="14"
                  required
                />
              </div>

              <div className="ath-form-group">
                <label className="ath-label">Water Intake (glasses)</label>
                <input
                  type="number"
                  className="ath-input"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  min="0"
                  max="20"
                  required
                />
              </div>
            </div>

            <div className="ath-form-group">
              <label className="ath-label">Mindfulness / Breathing (minutes)</label>
              <input
                type="number"
                className="ath-input"
                value={meditation}
                onChange={(e) => setMeditation(e.target.value)}
                min="0"
                max="120"
              />
            </div>

            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> Daily check-in saved to your wellness profile!
              </div>
            )}

            <button type="submit" className="ath-btn ath-btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              Save Today&apos;s Check-In
            </button>
          </form>
        </div>

        {/* RECOVERY & HABIT INSIGHTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ath-card" style={{ gap: '14px' }}>
            <div className="ath-card-header">
              <h2>
                <Smile size={20} color="#f59e0b" />
                Active Recovery Guidance
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Physical performance is built on physiological recovery. Your central nervous system requires deliberate down-regulation after competitive sports or demanding academic exams.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧘</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Box Breathing Routine</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Inhale 4s • Hold 4s • Exhale 4s • Hold 4s</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>📵</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Digital Sunset</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Turn off screens 45 minutes before sleep for deeper REM cycles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentAppLayout>
  )
}