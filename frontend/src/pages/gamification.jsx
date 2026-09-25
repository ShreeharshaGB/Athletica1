import { useState, useEffect } from 'react'
import {
  Award,
  Star,
  Trophy,
  Target,
  Calendar,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'
import './gamification.css'

const badges = [
  { name: 'First Assessment', desc: 'Completed full physical baseline test', icon: '🎯', unlocked: true },
  { name: 'Consistency Streak', desc: '3 consecutive days of workout logging', icon: '🔥', unlocked: true },
  { name: 'Hydration Hero', desc: 'Met daily water intake goal 5 days in a row', icon: '💧', unlocked: true },
  { name: 'Stamina Champion', desc: 'Improved sprint run time by >5%', icon: '⚡', unlocked: false },
  { name: 'Century Club', desc: 'Complete 100 sets of strength training', icon: '🛡️', unlocked: false },
  { name: 'Wellness Guru', desc: 'Complete 7 daily mood and sleep check-ins', icon: '🌿', unlocked: false },
]

const initialLeaderboard = [
  { rank: 1, name: 'Pooja R.', xp: 2450, badge: '🏆 Gold' },
  { rank: 2, name: 'Karthik N.', xp: 2180, badge: '🥈 Silver' },
  { rank: 3, name: 'Ananya S.', xp: 1950, badge: '🥉 Bronze' },
  { rank: 4, name: 'You (Alex Runner)', xp: 1250, badge: 'Level 3' },
  { rank: 5, name: 'Rohan M.', xp: 1100, badge: 'Level 2' },
]

export default function Gamification() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [joinedActivities, setJoinedActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const studentName = user?.name || 'Athlete'
  const institutionId = user?.institutionId || 'General'

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)
    try {
      const [actRes, joinedRes] = await Promise.all([
        apiRequest('/student/activities'),
        apiRequest('/student/activities/joined')
      ])
      setActivities(actRes.activities || [])
      setJoinedActivities(joinedRes.participations || [])
    } catch (err) {
      console.error('Failed to load student activities:', err)
      setError(err.message || 'Unable to load institution challenges.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleJoinActivity = async (activityId) => {
    setJoiningId(activityId)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await apiRequest(`/student/activities/${activityId}/join`, {
        method: 'POST'
      })
      setSuccessMsg(res.message || 'Successfully joined challenge! Points awarded.')

      // Refresh activity list & joined list
      const [actRes, joinedRes] = await Promise.all([
        apiRequest('/student/activities'),
        apiRequest('/student/activities/joined')
      ])
      setActivities(actRes.activities || [])
      setJoinedActivities(joinedRes.participations || [])
    } catch (err) {
      setError(err.message || 'Could not join activity.')
    } finally {
      setJoiningId(null)
    }
  }

  // Calculate points from joined challenges
  const activityPoints = joinedActivities.reduce((acc, curr) => acc + (curr.pointsAwarded || 0), 0)
  const totalXP = 1250 + activityPoints

  return (
    <StudentAppLayout
      pageTitle="Gamification & Achievements"
      pageSubtitle={`Earn XP, unlock verified badges, and compete in ${institutionId} challenges.`}
      eyebrow="REWARDS & MILESTONES"
      actions={
        <button
          type="button"
          className="ath-btn ath-btn-secondary"
          onClick={fetchActivities}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'ath-spin' : ''} />
          Refresh
        </button>
      }
    >
      {/* LEVEL & XP HERO */}
      <div
        className="ath-card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Star size={13} color="#facc15" fill="#facc15" /> ATHLETE STATUS • {institutionId}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
              Level 3 Athlete • {studentName}
            </h2>
            <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.88rem' }}>
              {totalXP.toLocaleString()} XP earned ({activityPoints > 0 ? `+${activityPoints} from challenges • ` : ''}750 XP needed to reach Level 4)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Current Streak</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c' }}>🔥 3 Days</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Challenges Joined</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6ee7b7' }}>⚡ {joinedActivities.length}</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>
            <span>Progress to Level 4</span>
            <span>62.5%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '62.5%', height: '100%', background: 'linear-gradient(90deg, #10b981, #5eead4)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {successMsg && (
        <div
          className="ath-card"
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 18px',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}
      {error && (
        <div
          className="ath-card"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 18px',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* ACTIVE CHALLENGES / ACTIVITIES */}
      <section id="challenges" className="ath-card" style={{ gap: '18px' }}>
        <div className="ath-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#0f766e" />
            <h2 style={{ margin: 0 }}>Active Challenges & Activities</h2>
          </div>
          <span className="ath-badge">
            {loading ? 'LOADING...' : `${activities.length} AVAILABLE`}
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="ath-spin" style={{ margin: '0 auto 8px', color: '#0f766e' }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading institution challenges...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
            <Target size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem', margin: '4px 0' }}>
              No challenges available for your institution yet.
            </p>
            <p style={{ fontSize: '0.84rem', margin: 0 }}>
              Your physical education instructors will post events and challenges here. Check back soon!
            </p>
          </div>
        )}

        {/* ACTIVITIES GRID */}
        {!loading && activities.length > 0 && (
          <div className="student-activity-grid">
            {activities.map((act) => {
              const statusClass = act.status ? act.status.toLowerCase() : 'active'
              const isEvent = act.type === 'event'
              const isJoined = act.hasJoined || joinedActivities.some((j) => (j.activity?.id || j.activityId) === act.id)

              return (
                <div key={act.id} className={`student-act-card ${isJoined ? 'joined' : ''}`}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span className={`act-type-tag ${isEvent ? 'event' : 'challenge'}`}>
                        {isEvent ? '📅 Event' : '⚡ Challenge'}
                      </span>
                      <span className={`act-status-pill ${statusClass}`}>
                        ● {act.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                      {act.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                      {act.description || 'Complete this challenge to earn points and boost your athletic ranking.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} color="#0f766e" />
                        {new Date(act.startDate).toLocaleDateString()} - {new Date(act.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#0f766e' }}>
                        <Award size={14} />
                        +{act.points} PTS
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748b' }}>
                        <Users size={14} />
                        {act.participantCount || 0} participants
                      </span>

                      {isJoined ? (
                        <span
                          className="ath-badge success"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={15} /> Joined
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="ath-btn ath-btn-primary"
                          style={{ padding: '7px 16px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleJoinActivity(act.id)}
                          disabled={joiningId === act.id}
                        >
                          {joiningId === act.id && <RefreshCw size={14} className="ath-spin" />}
                          {joiningId === act.id ? 'Joining...' : 'Join Challenge'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* MY ACTIVITIES */}
      <section id="my-activities" className="ath-card" style={{ gap: '16px' }}>
        <div className="ath-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#0f766e" />
            <h2 style={{ margin: 0 }}>My Activities</h2>
          </div>
          <span className="ath-badge success">
            {joinedActivities.length} ENROLLED
          </span>
        </div>

        {joinedActivities.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              You haven't joined any activities yet. Join a challenge above to participate and earn points!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {joinedActivities.map((part) => {
              const act = part.activity || {}
              return (
                <div key={part.id} className="my-activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                        {act.title || 'Institution Challenge'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Joined {part.joinedAt ? new Date(part.joinedAt).toLocaleDateString() : 'Recently'} • Status: <strong style={{ color: '#059669', textTransform: 'capitalize' }}>{part.status || 'joined'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="ath-badge success" style={{ fontWeight: 800 }}>
                      +{part.pointsAwarded || act.points || 0} PTS
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* TWO-COLUMN: BADGES + LEADERBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* BADGES COLLECTION */}
        <div className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <h2>
              <Award size={20} color="#0f766e" />
              Badges & Accolades
            </h2>
            <span className="ath-badge success">3 UNLOCKED</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {badges.map((b, i) => (
              <div
                key={i}
                style={{
                  background: b.unlocked ? '#ffffff' : '#f8fafc',
                  border: b.unlocked ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  opacity: b.unlocked ? 1 : 0.6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '1.8rem' }}>{b.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{b.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>{b.desc}</div>
                {b.unlocked && (
                  <span className="ath-badge success" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                    UNLOCKED ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <h2>
              <Trophy size={20} color="#f59e0b" />
              Class Cohort Leaderboard
            </h2>
            <span className="ath-badge">UPDATED HOURLY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {initialLeaderboard.map((student) => {
              const isMe = student.name.includes('You')
              const studentXP = isMe ? totalXP : student.xp
              return (
                <div
                  key={student.rank}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isMe ? '#e6f7f2' : '#f8fafc',
                    border: isMe ? '1px solid #0f766e' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: student.rank <= 3 ? '#fef3c7' : '#e2e8f0', color: student.rank <= 3 ? '#92400e' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                      {student.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isMe ? '#0f766e' : '#0f172a' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{student.badge}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>
                    {studentXP} XP
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </StudentAppLayout>
  )
}