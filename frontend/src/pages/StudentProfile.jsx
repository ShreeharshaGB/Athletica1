import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import './StudentDashboard.css'

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
      .catch(() => {
        // No existing profile
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFeedback('')
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '36px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '20px', padding: '36px 32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e6f7f2', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Student Athlete Profile
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
              {user?.email} • {isExisting ? 'Update your metrics' : 'Complete onboarding profile'}
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Fitness Goal
              </label>
              <input
                type="text"
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                required
                placeholder="e.g. Build Endurance, Increase Speed"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Diet Preference
                </label>
                <select
                  name="dietPreference"
                  value={formData.dietPreference}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>
            </div>

            {feedback && (
              <p style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                {feedback}
              </p>
            )}

            {success && (
              <p style={{ padding: '10px 14px', background: '#f0fdf4', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Profile saved successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
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
              }}
            >
              {saving ? 'Saving Profile...' : isExisting ? 'Update Profile' : 'Create Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
