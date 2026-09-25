import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Trophy, ArrowRight, ShieldCheck } from 'lucide-react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import StudentAppLayout from '../components/StudentAppLayout'

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
    <StudentAppLayout
      pageTitle="Verified Fitness Passport"
      pageSubtitle="Your official digital athletic and movement credential verified by Athletica protocols."
      eyebrow="DIGITAL CREDENTIAL"
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* PASSPORT CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #0f766e 60%, #115e59 100%)',
            borderRadius: '24px',
            padding: '32px 36px',
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(6, 78, 59, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle watermarked background logo */}
          <div
            style={{
              position: 'absolute',
              right: '-30px',
              bottom: '-30px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
                <ShieldCheck size={14} /> OFFICIAL DIGITAL CREDENTIAL
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
                {user?.name || 'Student Athlete'}
              </h2>
              <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.88rem' }}>
                ID: ATH-{user?.id ? user.id.slice(-6).toUpperCase() : 'STUDENT'} • Verified Student Member
              </p>
            </div>

            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={30} color="#fef08a" />
            </div>
          </div>

          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '20px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Fitness Score</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                {assessment?.overallScore || (assessment ? 80 : '--')}
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>/100</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Performance Tier</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {assessment?.fitnessLevel || (assessment ? 'Active' : 'Pending')}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Verification Status</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {assessment ? 'Certified ✓' : 'Unverified'}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED MEASUREMENT CARDS */}
        {loading ? (
          <div className="ath-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#64748b', margin: 0 }}>Loading passport telemetry...</p>
          </div>
        ) : assessment ? (
          <div className="ath-card" style={{ gap: '20px' }}>
            <div className="ath-card-header">
              <h2>Certified Test Telemetry</h2>
              <span className="ath-badge success">VERIFIED PROTOCOL</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Push-ups</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                  {assessment.pushUps} reps
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Upper Body</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Sit-ups</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                  {assessment.sitUps} reps
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Core Endurance</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>50m Dash</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                  {assessment.runTime} s
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Sprint Velocity</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Flexibility</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                  {assessment.flexibility} cm
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Hamstring Range</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Shuttle Run</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                  {assessment.shuttleRun} s
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Lateral Agility</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Link to="/student/assessment" className="ath-btn ath-btn-outline">
                Retake Assessment Test
              </Link>
            </div>
          </div>
        ) : (
          <div className="ath-empty-state" style={{ padding: '48px 24px' }}>
            <Award size={42} color="#94a3b8" />
            <h3>No Verified Assessment on Record</h3>
            <p>Complete your standardized fitness assessment to mint your verified digital Fitness Passport.</p>
            <Link to="/student/assessment" className="ath-btn ath-btn-primary" style={{ marginTop: '10px' }}>
              Take Assessment Now <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </StudentAppLayout>
  )
}
