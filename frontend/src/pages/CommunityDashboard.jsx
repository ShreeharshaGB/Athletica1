import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Activity,
  Apple,
  Dumbbell,
  TrendingUp,
  X,
  ClipboardCheck,
  HeartPulse,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import './CommunityDashboard.css'

export default function CommunityDashboard() {
  const { user } = useAuth()

  // State
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [activityFeed, setActivityFeed] = useState([])

  // Create Challenge Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    points: 100,
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Join Action State
  const [joiningId, setJoiningId] = useState(null)
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('')

  // Load Community Data
  const loadCommunityData = async () => {
    try {
      setLoading(true)
      const [profRes, chalRes, leadRes, feedRes] = await Promise.allSettled([
        apiRequest('/community/profile'),
        apiRequest('/community/challenges'),
        apiRequest('/community/leaderboard'),
        apiRequest('/community/activity-feed'),
      ])

      if (profRes.status === 'fulfilled') setProfile(profRes.value)
      if (chalRes.status === 'fulfilled') setChallenges(chalRes.value?.challenges || [])
      if (leadRes.status === 'fulfilled') setLeaderboard(leadRes.value?.leaderboard || [])
      if (feedRes.status === 'fulfilled') setActivityFeed(feedRes.value?.feed || [])
    } catch (err) {
      console.warn('Failed to load community dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommunityData()
  }, [])

  // Join Challenge Handler
  const handleJoinChallenge = async (challengeId, challengeTitle) => {
    try {
      setJoiningId(challengeId)
      setJoinSuccessMsg('')
      const res = await apiRequest(`/community/challenges/${challengeId}/join`, {
        method: 'POST',
      })
      if (res) {
        setJoinSuccessMsg(`Joined "${challengeTitle}"! Points credited to your rank.`)
        loadCommunityData()
        setTimeout(() => setJoinSuccessMsg(''), 4500)
      }
    } catch (err) {
      alert(err.message || 'Could not join challenge. Please try again.')
    } finally {
      setJoiningId(null)
    }
  }

  // Create Challenge Handler
  const handleCreateChallenge = async (e) => {
    e.preventDefault()
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setCreateError('Please provide a challenge title and description.')
      return
    }

    try {
      setCreating(true)
      setCreateError('')

      await apiRequest('/community/challenges', {
        method: 'POST',
        body: createForm,
      })

      setShowCreateModal(false)
      setCreateForm({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        points: 100,
      })
      loadCommunityData()
    } catch (err) {
      setCreateError(err.message || 'Failed to create challenge.')
    } finally {
      setCreating(false)
    }
  }

  const communityId = profile?.communityId || user?.communityId || 'MANGALORE-FITNESS'
  const communityName = profile?.communityName || 'Community Network'

  return (
    <StudentAppLayout
      pageTitle={`${communityName} Hub`}
      pageSubtitle={`Community ID: ${communityId} • Peer challenges, health circles, and grassroots fitness.`}
      eyebrow={`ATHLETICA COMMUNITY • ${communityId}`}
    >
      <div className="community-container">
        {/* =========================================================
            1. HERO BANNER
            ========================================================= */}
        <div className="community-hero-banner">
          <div>
            <div className="community-hero-badge">
              <Users size={14} />
              <span>{communityId}</span>
            </div>
            <h1 className="community-hero-title">{communityName}</h1>
            <p className="community-hero-desc">
              Welcome to your community fitness portal. Discover peer challenges, participate in group movement goals, and track your athletic milestones.
            </p>
          </div>

          <button
            type="button"
            className="ath-btn ath-btn-primary"
            style={{ padding: '12px 22px', fontSize: '0.92rem' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Challenge
          </button>
        </div>

        {/* =========================================================
            2. STATS ROW: [Members] [Active Challenges] [My Points] [My Rank]
            ========================================================= */}
        <div className="community-stats-grid">
          {/* Members */}
          <div className="community-stat-card">
            <div className="community-stat-header">
              <span className="community-stat-label">Members</span>
              <div className="community-stat-icon-wrap">
                <Users size={18} />
              </div>
            </div>
            <div className="community-stat-value">
              {loading ? '...' : profile?.membersCount || 1}
            </div>
            <p className="community-stat-sub">
              Active in {communityId}
            </p>
          </div>

          {/* Active Challenges */}
          <div className="community-stat-card teal">
            <div className="community-stat-header">
              <span className="community-stat-label">Active Challenges</span>
              <div className="community-stat-icon-wrap">
                <Trophy size={18} />
              </div>
            </div>
            <div className="community-stat-value">
              {loading ? '...' : profile?.activeChallengesCount || challenges.length}
            </div>
            <p className="community-stat-sub">
              Community fitness goals
            </p>
          </div>

          {/* My Points */}
          <div className="community-stat-card amber">
            <div className="community-stat-header">
              <span className="community-stat-label">My Points</span>
              <div className="community-stat-icon-wrap amber">
                <Flame size={18} />
              </div>
            </div>
            <div className="community-stat-value">
              {loading ? '...' : profile?.myPoints || 0}
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                pts
              </span>
            </div>
            <p className="community-stat-sub">
              Earned from participation
            </p>
          </div>

          {/* My Rank */}
          <div className="community-stat-card purple">
            <div className="community-stat-header">
              <span className="community-stat-label">My Rank</span>
              <div className="community-stat-icon-wrap purple">
                <Award size={18} />
              </div>
            </div>
            <div className="community-stat-value">
              {loading ? '...' : `#${profile?.myRank || 1}`}
            </div>
            <p className="community-stat-sub">
              On community leaderboard
            </p>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {joinSuccessMsg && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
            <span>{joinSuccessMsg}</span>
          </div>
        )}

        {/* =========================================================
            3. COMMUNITY CHALLENGES
            ========================================================= */}
        <section id="challenges" className="community-card">
          <div className="community-card-header">
            <div>
              <h2 className="community-card-title">
                <Trophy size={20} style={{ color: '#0f766e' }} />
                Community Challenges
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Challenges created by and for {communityName} members
              </span>
            </div>

            <button
              type="button"
              className="ath-btn ath-btn-primary"
              style={{ fontSize: '0.82rem', padding: '7px 16px' }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> New Challenge
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Loading community challenges...
            </div>
          ) : challenges.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '14px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <Trophy size={36} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>
                No challenges created yet in {communityId}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px' }}>
                Be the first to create a 7-day running, walking, or habit challenge for your community!
              </p>
              <button
                type="button"
                className="ath-btn ath-btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} /> Create First Challenge
              </button>
            </div>
          ) : (
            <div className="community-challenges-grid">
              {challenges.map((chal) => {
                const startStr = new Date(chal.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                const endStr = new Date(chal.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })

                return (
                  <div key={chal.id} className="community-challenge-card">
                    <div>
                      <div className="challenge-top-row">
                        <span className="challenge-points-badge">
                          +{chal.points} pts
                        </span>
                        <span
                          className="ath-badge"
                          style={{
                            background:
                              chal.status === 'Active'
                                ? '#ecfdf5'
                                : chal.status === 'Upcoming'
                                ? '#eff6ff'
                                : '#f1f5f9',
                            color:
                              chal.status === 'Active'
                                ? '#059669'
                                : chal.status === 'Upcoming'
                                ? '#2563eb'
                                : '#64748b',
                          }}
                        >
                          {chal.status}
                        </span>
                      </div>

                      <h3 className="challenge-title" style={{ marginTop: '10px' }}>
                        {chal.title}
                      </h3>
                      <p className="challenge-desc">{chal.description}</p>
                    </div>

                    <div>
                      <div className="challenge-meta-row">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {startStr} – {endStr}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={13} /> {chal.participantCount} joined
                        </span>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        {chal.isJoined ? (
                          <button
                            type="button"
                            className="ath-btn"
                            disabled
                            style={{
                              width: '100%',
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              justifyContent: 'center',
                            }}
                          >
                            <CheckCircle2 size={16} /> Joined
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ath-btn ath-btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={joiningId === chal.id}
                            onClick={() => handleJoinChallenge(chal.id, chal.title)}
                          >
                            {joiningId === chal.id ? 'Joining...' : 'Join Challenge'}
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

        {/* =========================================================
            4. COMMUNITY LEADERBOARD
            ========================================================= */}
        <section id="leaderboard" className="community-card">
          <div className="community-card-header">
            <div>
              <h2 className="community-card-title">
                <Award size={20} style={{ color: '#0f766e' }} />
                Community Leaderboard
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Rankings scoped strictly to {communityId} members
              </span>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No points recorded yet in this community. Join challenges to climb the leaderboard!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="community-leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Member</th>
                    <th>Challenges Joined</th>
                    <th style={{ textAlign: 'right' }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`leaderboard-row ${entry.isCurrentUser ? 'current-user' : ''}`}
                    >
                      <td>
                        <span
                          className={`leaderboard-rank-badge ${
                            entry.rank === 1
                              ? 'rank-1'
                              : entry.rank === 2
                              ? 'rank-2'
                              : entry.rank === 3
                              ? 'rank-3'
                              : 'rank-other'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="ath-badge" style={{ background: '#0f766e', color: '#ffffff', fontSize: '0.68rem', padding: '2px 6px' }}>
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{entry.challengesJoined} challenge(s)</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                        {entry.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =========================================================
            5. MY FITNESS (QUICK-LAUNCH TO SHARED PERSONAL FITNESS)
            ========================================================= */}
        <section className="community-card">
          <div className="community-card-header">
            <div>
              <h2 className="community-card-title">
                <HeartPulse size={20} style={{ color: '#0f766e' }} />
                My Fitness
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Your personal athletic tools, AI vision analyses, and nutritional telemetry
              </span>
            </div>
          </div>

          <div className="fitness-launch-grid">
            <Link to="/student/assessment" className="fitness-launch-card">
              <div className="fitness-launch-icon-wrap">
                <ClipboardCheck size={20} />
              </div>
              <h4 className="fitness-launch-title">Fitness Assessment</h4>
              <p className="fitness-launch-desc">Log push-ups, endurance tests, and baseline scores.</p>
            </Link>

            <Link to="/student/physique-analysis" className="fitness-launch-card">
              <div className="fitness-launch-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Sparkles size={20} />
              </div>
              <h4 className="fitness-launch-title">Physique Analysis</h4>
              <p className="fitness-launch-desc">Multimodal AI analysis of visual kinetic posture.</p>
            </Link>

            <Link to="/student/nutrition" className="fitness-launch-card">
              <div className="fitness-launch-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Apple size={20} />
              </div>
              <h4 className="fitness-launch-title">Nutrition & Food</h4>
              <p className="fitness-launch-desc">Scan meals, log descriptions, and track macros.</p>
            </Link>

            <Link to="/student/workout" className="fitness-launch-card">
              <div className="fitness-launch-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Dumbbell size={20} />
              </div>
              <h4 className="fitness-launch-title">Workout Plan</h4>
              <p className="fitness-launch-desc">Daily conditioning schedules and guided exercises.</p>
            </Link>

            <Link to="/student/progress" className="fitness-launch-card">
              <div className="fitness-launch-icon-wrap" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <TrendingUp size={20} />
              </div>
              <h4 className="fitness-launch-title">Progress Telemetry</h4>
              <p className="fitness-launch-desc">Evaluate historical trends and metric curves.</p>
            </Link>
          </div>
        </section>

        {/* =========================================================
            6. RECENT COMMUNITY ACTIVITY
            ========================================================= */}
        <section className="community-card">
          <div className="community-card-header">
            <div>
              <h2 className="community-card-title">
                <Clock size={20} style={{ color: '#0f766e' }} />
                Recent Community Activity
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Real-time events inside {communityName}
              </span>
            </div>
          </div>

          {activityFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '26px', color: '#64748b', fontSize: '0.88rem' }}>
              No community activity yet. Join or create a challenge above to start the feed!
            </div>
          ) : (
            <div className="community-feed-list">
              {activityFeed.map((event) => (
                <div key={event.id} className="community-feed-item">
                  <div className="community-feed-icon-circle">
                    {event.type === 'join' ? <CheckCircle2 size={16} /> : <Trophy size={16} />}
                  </div>
                  <p className="community-feed-text">{event.text}</p>
                  <span className="community-feed-time">
                    {new Date(event.time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            MODAL: CREATE CHALLENGE
            ========================================================= */}
        {showCreateModal && (
          <div className="create-modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="create-modal-header">
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Create Community Challenge
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Publish a challenge for all {communityId} members
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateChallenge} className="create-modal-body">
                {createError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', color: '#991b1b', fontSize: '0.85rem' }}>
                    {createError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Day Morning Run"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Description & Goal
                  </label>
                  <textarea
                    placeholder="Describe what members should do (e.g. Run 5km every morning for 7 consecutive days)..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Completion Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={createForm.points}
                    onChange={(e) => setCreateForm({ ...createForm, points: Number(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ath-btn ath-btn-primary"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Publish Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentAppLayout>
  )
}
