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
import { useLanguage } from '../context/LanguageContext'
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

const fallbackLeaderboard = [
  { rank: 1, name: 'Pooja R.', xp: 2450, badge: '🏆 Gold', completedChallenges: 4 },
  { rank: 2, name: 'Karthik N.', xp: 2180, badge: '🥈 Silver', completedChallenges: 3 },
  { rank: 3, name: 'Ananya S.', xp: 1950, badge: '🥉 Bronze', completedChallenges: 2 },
  { rank: 4, name: 'You (Athlete)', xp: 1250, badge: 'Level 3', completedChallenges: 1, isCurrentUser: true },
  { rank: 5, name: 'Rohan M.', xp: 1100, badge: 'Level 2', completedChallenges: 0 },
]

export default function Gamification() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [activities, setActivities] = useState([])
  const [joinedActivities, setJoinedActivities] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [currentUserStats, setCurrentUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [completingId, setCompletingId] = useState(null)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const studentName = user?.name || t('athlete', 'Athlete')
  const institutionId = user?.institutionId || 'General'

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)
    try {
      const [actRes, joinedRes, leadRes] = await Promise.all([
        apiRequest('/student/activities').catch(() => ({ activities: [] })),
        apiRequest('/student/activities/joined').catch(() => ({ joinedActivities: [] })),
        apiRequest('/gamification/leaderboard').catch(() => null),
      ])
      const actList = actRes?.activities || []
      const joinedList = joinedRes?.joinedActivities || joinedRes?.participations || []

      // If joinedList returned empty, fallback to activities marked hasJoined
      if (joinedList.length === 0 && actList.some((a) => a.hasJoined)) {
        const fallbackJoined = actList
          .filter((a) => a.hasJoined)
          .map((a) => ({
            id: a.id,
            participationId: a.id,
            activityId: a.id,
            title: a.title,
            description: a.description,
            type: a.type,
            points: a.points,
            pointsAwarded: a.points,
            joinedAt: a.createdAt,
            startDate: a.startDate,
            endDate: a.endDate,
            status: a.status || 'Active',
            activity: a,
          }))
        setJoinedActivities(fallbackJoined)
      } else {
        setJoinedActivities(joinedList)
      }
      setActivities(actList)

      if (leadRes && leadRes.leaderboard && leadRes.leaderboard.length > 0) {
        setLeaderboard(leadRes.leaderboard)
        setCurrentUserStats(leadRes.currentUser)
      } else {
        setLeaderboard(fallbackLeaderboard)
        setCurrentUserStats(fallbackLeaderboard.find((s) => s.isCurrentUser))
      }
    } catch (err) {
      console.error('Failed to load gamification data:', err)
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
        method: 'POST',
      })
      setSuccessMsg(res.message || 'Successfully joined challenge! Points recorded.')
      await fetchActivities()
    } catch (err) {
      setError(err.message || 'Could not join activity.')
    } finally {
      setJoiningId(null)
    }
  }

  const handleCompleteActivity = async (activityId) => {
    if (!activityId) return
    setCompletingId(activityId)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await apiRequest(`/student/activities/${activityId}/complete`, {
        method: 'POST',
      })
      setSuccessMsg(res.message || 'Challenge completed! XP awarded.')
      await fetchActivities()
    } catch (err) {
      setError(err.message || 'Could not complete challenge.')
    } finally {
      setCompletingId(null)
    }
  }

  // Calculate points from joined challenges
  const activityPoints = joinedActivities.reduce((acc, curr) => acc + (curr.pointsAwarded || curr.points || 0), 0)
  const totalXP = currentUserStats?.xp || (1250 + activityPoints)
  const currentLevel = currentUserStats?.level || Math.max(1, Math.floor(totalXP / 500) + 1)
  const nextLevelXP = currentLevel * 500
  const progressPercent = Math.min(100, Math.max(10, Math.round(((totalXP % 500) / 500) * 100)))

  return (
    <StudentAppLayout
      pageTitle={t('gamification_title', 'Gamification & Achievements')}
      pageSubtitle={t('gamification_subtitle', `Earn XP, unlock verified badges, and compete in ${institutionId} challenges.`)}
      eyebrow={t('rewards_milestones', 'REWARDS & MILESTONES')}
      actions={
        <button
          type="button"
          className="ath-btn ath-btn-secondary"
          onClick={fetchActivities}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'ath-spin' : ''} />
          {t('refresh', 'Refresh')}
        </button>
      }
    >
      {/* LEVEL & XP HERO */}
      <div
        className="ath-card"
        style={{
          background: 'linear-gradient(135deg, #093430 0%, #0d5c55 50%, #115e59 100%)',
          color: '#ffffff',
          padding: '26px 30px',
          borderRadius: '20px',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          boxShadow: '0 8px 30px rgba(15, 118, 110, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Star size={13} color="#facc15" fill="#facc15" /> {t('athlete', 'ATHLETE STATUS')} • {institutionId}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
              {t('level', 'Level')} {currentLevel} {t('athlete', 'Athlete')} • {studentName}
            </h2>
            <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem' }}>
              {totalXP.toLocaleString()} {t('xp', 'XP')} {t('earned', 'earned')} ({activityPoints > 0 ? `+${activityPoints} PTS • ` : ''}{nextLevelXP - totalXP > 0 ? `${nextLevelXP - totalXP} XP needed to reach Level ${currentLevel + 1}` : 'Maximum Level Active'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{t('current_streak', 'Current Streak')}</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fde047' }}>🔥 {currentUserStats?.streak || 3} {t('days', 'Days')}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{t('challenges_joined', 'Challenges Joined')}</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5eead4' }}>⚡ {joinedActivities.length}</div>
            </div>
            {currentUserStats && (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(20, 184, 166, 0.4)' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{t('your_rank', 'Your Rank')}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>#{currentUserStats.rank}</div>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.9, marginBottom: '6px' }}>
            <span>{t('progress_to_level', 'Progress to Level')} {currentLevel + 1}</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #2dd4bf)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {successMsg && (
        <div
          className="ath-card"
          style={{
            background: 'var(--ath-primary-light, #ecfdf5)',
            border: '1px solid var(--ath-primary)',
            color: 'var(--ath-primary)',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 18px',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} color="var(--ath-primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}
      {error && (
        <div
          className="ath-card"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '12px 18px',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* ACTIVE CHALLENGES / ACTIVITIES */}
      <section id="challenges" className="ath-card" style={{ gap: '18px' }}>
        <div className="ath-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--ath-primary)" />
            <h2 style={{ margin: 0 }}>{t('active_challenges', 'Active Challenges & Activities')}</h2>
          </div>
          <span className="ath-badge">
            {loading ? t('loading', 'LOADING...') : `${activities.length} ${t('available', 'AVAILABLE')}`}
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ath-text-muted)' }}>
            <RefreshCw size={24} className="ath-spin" style={{ margin: '0 auto 8px', color: 'var(--ath-primary)' }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>{t('loading', 'Loading institution challenges...')}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && activities.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ath-text-muted)' }}>
            <Target size={36} color="var(--ath-text-muted)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, color: 'var(--ath-dark)', fontSize: '0.95rem', margin: '4px 0' }}>
              {t('no_challenges_available', 'No challenges available for your institution yet.')}
            </p>
            <p style={{ fontSize: '0.84rem', margin: 0 }}>
              {t('instructors_post_soon', 'Your physical education instructors will post events and challenges here. Check back soon!')}
            </p>
          </div>
        )}

        {/* ACTIVITIES GRID */}
        {!loading && activities.length > 0 && (
          <div className="student-activity-grid">
            {activities.map((act) => {
              const statusClass = act.status ? act.status.toLowerCase() : 'active'
              const isEvent = act.type === 'event'
              const isJoined = act.hasJoined || joinedActivities.some((j) => (j.activity?.id || j.activityId || j.id || j.participationId) === act.id)

              return (
                <div key={act.id} className={`student-act-card ${isJoined ? 'joined' : ''}`}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span className={`act-type-tag ${isEvent ? 'event' : 'challenge'}`}>
                        {isEvent ? `📅 ${t('nav_activities', 'Event')}` : `⚡ ${t('nav_challenges', 'Challenge')}`}
                      </span>
                      <span className={`act-status-pill ${statusClass}`}>
                        ● {act.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ath-dark)', margin: '0 0 6px' }}>
                      {act.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ath-text-muted)', margin: 0, lineHeight: 1.45 }}>
                      {act.description || 'Complete this challenge to earn points and boost your athletic ranking.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ath-text-muted)', paddingTop: '10px', borderTop: '1px solid var(--ath-border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} color="var(--ath-primary)" />
                        {new Date(act.startDate).toLocaleDateString()} - {new Date(act.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: 'var(--ath-primary)' }}>
                        <Award size={14} />
                        +{act.points} PTS
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--ath-text-muted)' }}>
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
                          <CheckCircle2 size={15} /> {t('joined', 'Joined')}
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
                          {joiningId === act.id ? t('joining', 'Joining...') : t('join_challenge', 'Join Challenge')}
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
            <Sparkles size={20} color="var(--ath-primary)" />
            <h2 style={{ margin: 0 }}>{t('my_activities', 'My Activities')}</h2>
          </div>
          <span className="ath-badge success">
            {joinedActivities.length} {t('enrolled', 'ENROLLED')}
          </span>
        </div>

        {joinedActivities.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ath-text-muted)', background: 'var(--ath-bg)', borderRadius: '12px', border: '1px dashed var(--ath-border)' }}>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              {t('no_activities_joined', "You haven't joined any activities yet. Join a challenge above to participate and earn points!")}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {joinedActivities.map((part) => {
              const act = part.activity || {}
              const title = part.title || act.title || 'Institution Challenge'
              const points = part.pointsAwarded ?? part.points ?? act.points ?? 0
              const isEvent = (part.type || act.type) === 'event'
              const partKey = part.participationId || part.id || part.activityId || title
              const rawStatus = (part.status || 'Active').toLowerCase()
              const isCompleted = rawStatus === 'completed'
              const targetActivityId = part.activityId || act.id || part.id

              return (
                <div key={partKey} className="my-activity-item" style={{ background: 'var(--ath-surface)', border: '1px solid var(--ath-border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isEvent ? 'rgba(168, 85, 247, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                        color: isEvent ? '#a855f7' : 'var(--ath-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {isEvent ? '📅' : '⚡'}
                    </div>
                    <div>
                      <div className="my-activity-title" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--ath-dark)' }}>
                        {title}
                      </div>
                      <div className="my-activity-meta" style={{ fontSize: '0.76rem', color: 'var(--ath-text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span>Joined {part.joinedAt ? new Date(part.joinedAt).toLocaleDateString() : 'Recently'}</span>
                        <span>•</span>
                        <span>
                          Status: <strong style={{ color: isCompleted ? '#10b981' : 'var(--ath-primary)', textTransform: 'capitalize' }}>{isCompleted ? t('completed', 'Completed') : t('active', 'Active')}</strong>
                        </span>
                        {(part.startDate || act.startDate) && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(part.startDate || act.startDate).toLocaleDateString()} - {new Date(part.endDate || act.endDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="ath-badge success" style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                      +{points} PTS
                    </span>

                    {isCompleted ? (
                      <span className="ath-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                        <CheckCircle2 size={13} /> {t('completed', 'Completed')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="ath-btn ath-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => handleCompleteActivity(targetActivityId)}
                        disabled={completingId === targetActivityId}
                      >
                        {completingId === targetActivityId && <RefreshCw size={12} className="ath-spin" />}
                        {completingId === targetActivityId ? t('submitting', 'Submitting...') : t('complete_challenge', 'Complete Challenge')}
                      </button>
                    )}
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
              <Award size={20} color="var(--ath-primary)" />
              {t('badges_accolades', 'Badges & Accolades')}
            </h2>
            <span className="ath-badge success">3 {t('unlocked', 'UNLOCKED')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {badges.map((b, i) => (
              <div
                key={i}
                style={{
                  background: b.unlocked ? 'var(--ath-surface)' : 'var(--ath-bg)',
                  border: b.unlocked ? '1px solid var(--ath-border)' : '1px dashed var(--ath-border)',
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
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ath-dark)' }}>{b.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ath-text-muted)', lineHeight: 1.35 }}>{b.desc}</div>
                {b.unlocked && (
                  <span className="ath-badge success" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                    {t('unlocked', 'UNLOCKED')} ✓
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
              {t('leaderboard_cohort', 'Cohort Leaderboard')}
            </h2>
            <span className="ath-badge">{t('updated_hourly', 'UPDATED HOURLY')}</span>
          </div>

          {/* Current User Rank Highlight */}
          {currentUserStats && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--ath-primary-light, rgba(20, 184, 166, 0.12))',
                border: '1px solid var(--ath-primary)',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} color="var(--ath-primary)" />
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ath-primary)', fontWeight: 800 }}>
                    {t('your_rank', 'Your Rank')}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ath-dark)' }}>
                    #{currentUserStats.rank} • {currentUserStats.name}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ath-primary)' }}>
                  {currentUserStats.xp} {t('xp', 'XP')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ath-text-muted)' }}>
                  {currentUserStats.completedChallenges || 0} {t('completed', 'completed')}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboard.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ath-text-muted)' }}>
                {loading ? t('loading', 'Loading...') : 'No athletes ranked in this cohort yet.'}
              </div>
            ) : (
              leaderboard.map((student) => {
                const isMe = student.isCurrentUser
                return (
                  <div
                    key={student.id || student.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isMe ? 'var(--ath-primary-light, rgba(20, 184, 166, 0.12))' : 'var(--ath-surface)',
                      border: isMe ? '1px solid var(--ath-primary)' : '1px solid var(--ath-border)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: student.rank <= 3 ? '#fef3c7' : 'var(--ath-border-subtle)',
                          color: student.rank <= 3 ? '#92400e' : 'var(--ath-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {student.rank}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isMe ? 'var(--ath-primary)' : 'var(--ath-dark)' }}>
                          {student.name} {isMe ? `(${t('athlete', 'You')})` : ''}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ath-text-muted)' }}>
                          {student.badge || `Level ${student.level || 1}`} • {student.completedChallenges || 0} {t('completed', 'completed')}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--ath-primary)' }}>
                      {student.xp} {t('xp', 'XP')}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </StudentAppLayout>
  )
}