import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ArrowLeft, Trophy } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import './StudentDashboard.css'

export default function FitnessPassport() {
  const { user } = useAuth()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/student/assessment')
      .then((data) => setAssessment(data.assessment))
      .catch(() => setAssessment(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '36px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '36px 32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', borderRadius: '18px', padding: '28px', color: '#ffffff', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                OFFICIAL FITNESS PASSPORT
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '14px 0 4px' }}>
                {user?.name || 'Student Athlete'}
              </h1>
              <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem' }}>
                Athletica Digital Health & Movement Credential
              </p>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={28} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Fitness Score</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{assessment?.overallScore || (assessment ? 80 : '--')}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Fitness Tier</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{assessment?.fitnessLevel || (assessment ? 'Active' : 'Unassessed')}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Verification</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{assessment ? 'Verified ✓' : 'Pending'}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading passport data...</p>
        ) : assessment ? (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0f172a', marginBottom: '16px' }}>
              Assessment Breakdown
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Push-ups</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>{assessment.pushUps} reps</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sit-ups</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>{assessment.sitUps} reps</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sprint Time</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>{assessment.runTime} s</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Flexibility</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>{assessment.flexibility} cm</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Shuttle Run</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>{assessment.shuttleRun} s</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '16px' }}>
            <Award size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              No Verified Assessment Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
              Take your fitness assessment to generate your verified Fitness Passport credentials.
            </p>
            <Link to="/student/assessment" style={{ display: 'inline-flex', padding: '10px 18px', background: '#0f766e', color: '#ffffff', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
              Take Assessment Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
