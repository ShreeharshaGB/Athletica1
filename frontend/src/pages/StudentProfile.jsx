import { useEffect, useState } from 'react'
import { User, CheckCircle2, HeartPulse, Sparkles } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import StudentAppLayout from '../components/StudentAppLayout'

export default function StudentProfile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    age: '18',
    gender: 'female',
    height: '165',
    weight: '55',
    location: '',
    fitnessGoal: 'Build Endurance & Strength',
    activityLevel: 'intermediate',
    dietPreference: 'vegetarian',
  })
  const [isExisting, setIsExisting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    apiRequest('/student/profile')
      .then((data) => {
        if (data.profile) {
          setIsExisting(true)
          setFormData({
            age: String(data.profile.age || '18'),
            gender: data.profile.gender || 'female',
            height: String(data.profile.height || '165'),
            weight: String(data.profile.weight || '55'),
            location: data.profile.location || '',
            fitnessGoal: data.profile.fitnessGoal || 'Build Endurance & Strength',
            activityLevel: data.profile.activityLevel || 'intermediate',
            dietPreference: data.profile.dietPreference || 'vegetarian',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFeedback('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback('')
    setSuccess(false)

    try {
      const payload = {
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        location: formData.location.trim(),
        fitnessGoal: formData.fitnessGoal.trim(),
        activityLevel: formData.activityLevel,
        dietPreference: formData.dietPreference,
      }

      await apiRequest('/student/profile', {
        method: isExisting ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })

      setIsExisting(true)
      setSuccess(true)
    } catch (err) {
      setFeedback(err.message || 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const isCommunity = user?.role === 'community'

  return (
    <StudentAppLayout
      pageTitle={isCommunity ? 'Community Profile Settings' : 'Athlete Profile Settings'}
      pageSubtitle={
        isCommunity
          ? 'Manage your physical baseline measurements, daily activity routine, and wellness goals.'
          : 'Manage your physical baseline measurements, dietary preferences, and training aspirations.'
      }
      eyebrow={isCommunity ? 'COMMUNITY ACCOUNT & BIOMETRICS' : 'ACCOUNT & BIOMETRICS'}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div className="ath-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--ath-text-muted)', margin: 0 }}>Loading profile metrics...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. PERSONAL INFORMATION */}
            <div className="ath-card" style={{ gap: '18px' }}>
              <div className="ath-card-header">
                <h2>
                  <User size={19} color="#0f766e" />
                  Personal Information
                </h2>
                <span className="ath-badge">{user?.email}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div className="ath-form-group">
                  <label className="ath-label">Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    className="ath-input"
                    value={formData.age}
                    onChange={handleChange}
                    min="5"
                    max="100"
                    required
                  />
                </div>

                <div className="ath-form-group">
                  <label className="ath-label">Gender</label>
                  <select
                    name="gender"
                    className="ath-select"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="ath-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="ath-label">
                    {isCommunity ? 'Residential / Community Location (City, Town or Village)' : 'School / College / Training Location (optional)'}
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="ath-input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={isCommunity ? 'e.g. Indiranagar, Bengaluru or Dharwad Rural' : 'e.g. KV School Sports Wing'}
                  />
                </div>
              </div>
            </div>

            {/* 2. PHYSICAL BIOMETRICS */}
            <div className="ath-card" style={{ gap: '18px' }}>
              <div className="ath-card-header">
                <h2>
                  <HeartPulse size={19} color="#3b82f6" />
                  Physical Measurements
                </h2>
                <span className="ath-badge info">FOR BMI CALCULATION</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div className="ath-form-group">
                  <label className="ath-label">Height (centimeters)</label>
                  <input
                    type="number"
                    name="height"
                    className="ath-input"
                    value={formData.height}
                    onChange={handleChange}
                    min="50"
                    max="250"
                    required
                  />
                </div>

                <div className="ath-form-group">
                  <label className="ath-label">Weight (kilograms)</label>
                  <input
                    type="number"
                    name="weight"
                    className="ath-input"
                    value={formData.weight}
                    onChange={handleChange}
                    min="20"
                    max="250"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. DIET & TRAINING PREFERENCES */}
            <div className="ath-card" style={{ gap: '18px' }}>
              <div className="ath-card-header">
                <h2>
                  <Sparkles size={19} color="#f59e0b" />
                  Dietary & Athletic Goals
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div className="ath-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="ath-label">Primary Fitness Goal</label>
                  <input
                    type="text"
                    name="fitnessGoal"
                    className="ath-input"
                    value={formData.fitnessGoal}
                    onChange={handleChange}
                    placeholder="e.g. Build Endurance & Increase Sprint Speed"
                    required
                  />
                </div>

                <div className="ath-form-group">
                  <label className="ath-label">Activity Level</label>
                  <select
                    name="activityLevel"
                    className="ath-select"
                    value={formData.activityLevel}
                    onChange={handleChange}
                  >
                    <option value="beginner">Beginner (1–2 days/week)</option>
                    <option value="intermediate">Intermediate (3–4 days/week)</option>
                    <option value="advanced">Advanced (5+ days/week)</option>
                  </select>
                </div>

                <div className="ath-form-group">
                  <label className="ath-label">Diet Preference</label>
                  <select
                    name="dietPreference"
                    className="ath-select"
                    value={formData.dietPreference}
                    onChange={handleChange}
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                  </select>
                </div>
              </div>
            </div>

            {feedback && (
              <p style={{ padding: '12px 16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '10px', fontSize: '0.88rem', margin: 0 }}>
                {feedback}
              </p>
            )}

            {success && (
              <div style={{ padding: '12px 16px', background: '#ecfdf5', color: '#065f46', borderRadius: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Profile parameters updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="ath-btn ath-btn-primary"
              style={{ padding: '14px', fontSize: '0.95rem' }}
            >
              {saving ? 'Saving Changes...' : isExisting ? 'Save Profile Changes' : 'Complete Profile Setup'}
            </button>
          </form>
        )}
      </div>
    </StudentAppLayout>
  )
}
