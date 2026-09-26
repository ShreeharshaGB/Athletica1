import { useEffect, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  LogIn,
  RefreshCw,
  Users,
  Award,
  ArrowLeft,
  Clock,
  Check,
  Sparkles,
  Dumbbell,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function StudentClassrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const [classroomDetail, setClassroomDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'peers'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadClassrooms = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/student/classrooms')
      setClassrooms(response.classrooms || [])
    } catch (err) {
      setError(err.message || 'Could not load joined classrooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassroomDetail = async (id) => {
    setDetailLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await apiRequest(`/student/classrooms/${id}`)
      setClassroomDetail(res.classroom)
      setSelectedClassroomId(id)
    } catch (err) {
      setError(err.message || 'Could not load classroom details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleJoin = async (event) => {
    event.preventDefault()
    if (!code.trim()) {
      setError('Enter the invite code your teacher shared.')
      return
    }
    setJoining(true)
    setError('')
    setMessage('')
    try {
      const response = await apiRequest('/student/classrooms/join', {
        method: 'POST',
        body: { code: code.trim() },
      })
      setClassrooms((current) =>
        current.some((item) => item.id === response.classroom.id)
          ? current
          : [response.classroom, ...current]
      )
      setCode('')
      setMessage(response.message)
    } catch (err) {
      setError(err.message || 'Could not join classroom.')
    } finally {
      setJoining(false)
    }
  }

  const handleCompleteTask = async (taskId) => {
    setCompletingTaskId(taskId)
    setError('')
    setMessage('')
    try {
      const res = await apiRequest(`/student/classrooms/${selectedClassroomId}/tasks/${taskId}/complete`, {
        method: 'POST',
        body: { notes: 'Completed via Athletica Student Portal' },
      })
      setMessage(res.message || 'Challenge completed! Points recorded.')
      // Refresh classroom details
      await loadClassroomDetail(selectedClassroomId)
    } catch (err) {
      setError(err.message || 'Failed to mark task complete.')
    } finally {
      setCompletingTaskId(null)
    }
  }

  // ==========================================
  // VIEW: SINGLE CLASSROOM DETAIL VIEW
  // ==========================================
  if (selectedClassroomId && classroomDetail) {
    const tasks = classroomDetail.tasks || []
    const members = classroomDetail.members || []
    const completedTasksCount = tasks.filter((t) => t.hasCompleted).length

    return (
      <StudentAppLayout
        eyebrow="CLASSROOM HUB"
        pageTitle={classroomDetail.name}
        pageSubtitle={classroomDetail.description || 'Access assigned tasks, complete physical fitness challenges, and view class peers.'}
      >
        <div className="classroom-page">
          <button
            type="button"
            className="classroom-back-btn"
            onClick={() => {
              setSelectedClassroomId(null)
              setClassroomDetail(null)
              setMessage('')
              setError('')
            }}
          >
            <ArrowLeft size={16} /> Back to joined classrooms
          </button>

          {/* CLASSROOM HERO */}
          <div className="classroom-detail-hero student-hero">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  <BookOpen size={13} /> STUDENT CLASSROOM
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {classroomDetail.name}
                </h1>
                <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem', maxWidth: '600px' }}>
                  {classroomDetail.description || 'Physical training and wellness cohort.'}
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#a5f3fc' }}>
                  Instructor: <strong>{classroomDetail.teacher?.name || 'Faculty Coach'}</strong> ({classroomDetail.teacher?.email})
                </div>
              </div>

              {/* PROGRESS BADGE */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(4px)',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center',
                }}
              >
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#99f6e4', fontWeight: 800, letterSpacing: '0.08em' }}>
                  YOUR CLASS PROGRESS
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#ffffff' }}>
                  {completedTasksCount} / {tasks.length}
                </strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#ccfbf1', marginTop: '2px' }}>
                  Tasks Completed
                </span>
              </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#99f6e4" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>{members.length}</strong> Enrolled Students
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#99f6e4" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>{tasks.length}</strong> Assigned Activities
                </span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="classroom-tabs">
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <Award size={16} /> Assigned Challenges ({tasks.length})
            </button>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'peers' ? 'active' : ''}`}
              onClick={() => setActiveTab('peers')}
            >
              <Users size={16} /> Classmates ({members.length})
            </button>
          </div>

          {message && (
            <div className="classroom-success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={16} /> {message}
            </div>
          )}

          {error && (
            <div className="classroom-error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* TAB 1: CHALLENGES & TASKS */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                  Class Tasks & Challenges
                </h3>
              </div>

              {tasks.length === 0 ? (
                <div className="classroom-empty-state">
                  <Award size={36} color="#94a3b8" />
                  <p style={{ fontWeight: 700, color: '#334155' }}>No tasks assigned yet by your teacher.</p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Check back soon! Your instructor will post fitness drills, workouts, and team challenges here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => {
                    const isDue = task.dueDate ? new Date(task.dueDate) < new Date() : false
                    const isCompleted = task.hasCompleted

                    return (
                      <article
                        className="classroom-task-card"
                        key={task.id}
                        style={{
                          borderLeft: isCompleted ? '4px solid #10b981' : '4px solid #0f766e',
                        }}
                      >
                        <div className="classroom-task-header">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span className={`task-type-badge ${task.type}`}>
                                {task.type === 'challenge' ? '⚡ Challenge' : task.type === 'workout' ? '🏋️ Workout' : task.type === 'yoga' ? '🧘 Yoga' : '📋 Task'}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f766e' }}>
                                +{task.points} PTS
                              </span>
                              {task.dueDate && (
                                <span style={{ fontSize: '0.72rem', color: isDue ? '#dc2626' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#0f172a' }}>
                              {task.title}
                            </h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.45 }}>
                              {task.description || 'Complete this task to fulfill PE targets and boost athletic ranking.'}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            {isCompleted ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                }}
                              >
                                <CheckCircle2 size={16} /> Completed
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="ath-btn ath-btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                                disabled={completingTaskId === task.id}
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                {completingTaskId === task.id ? (
                                  <RefreshCw size={14} className="ath-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                                {completingTaskId === task.id ? 'Submitting...' : 'Mark Completed'}
                              </button>
                            )}
                          </div>
                        </div>

                        {isCompleted && task.completedAt && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                            ✓ Verified completion on {new Date(task.completedAt).toLocaleDateString()} • +{task.points} PTS Earned
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLASSMATES ROSTER */}
          {activeTab === 'peers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                  Enrolled Classmates ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <div className="classroom-empty-state">
                  <Users size={36} color="#94a3b8" />
                  <p style={{ fontWeight: 700, color: '#334155' }}>No other students enrolled yet.</p>
                </div>
              ) : (
                <div className="classroom-roster-grid">
                  {members.map((member) => (
                    <div className="classroom-student-item" key={member.id}>
                      <div className="classroom-student-avatar">
                        {(member.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Member since {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </StudentAppLayout>
    )
  }

  // ==========================================
  // VIEW: MAIN STUDENT CLASSROOMS LIST
  // ==========================================
  return (
    <StudentAppLayout
      eyebrow="YOUR LEARNING SPACES"
      pageTitle="Classrooms"
      pageSubtitle="Join your teacher's physical education groups, open classrooms to view assigned tasks, and complete challenges."
    >
      <div className="classroom-page">
        <section className="classroom-hero student-hero">
          <div className="classroom-hero-icon">
            <Users size={25} />
          </div>
          <div>
            <p className="classroom-eyebrow">STUDENT PORTAL</p>
            <h2>Join classrooms and access your physical training tasks.</h2>
            <p>
              Enter the invite code shared by your teacher to join your section. Open any classroom below to see assigned fitness tasks, yoga drills, and group challenges.
            </p>
          </div>
        </section>

        {/* JOIN PANEL */}
        <section className="classroom-panel join-panel">
          <div className="classroom-panel-heading">
            <div>
              <LogIn size={18} />
              <h3>Join a Classroom</h3>
            </div>
          </div>
          <form className="join-form" onSubmit={handleJoin}>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Enter invite code (e.g. AB12CD34)"
              maxLength={12}
              aria-label="Classroom invite code"
            />
            <button type="submit" className="ath-btn ath-btn-primary" disabled={joining}>
              {joining ? <RefreshCw size={16} className="ath-spin" /> : <LogIn size={16} />}
              {joining ? 'Joining...' : 'Join Classroom'}
            </button>
          </form>
          {message && (
            <p className="classroom-success" role="status">
              <CheckCircle2 size={16} /> {message}
            </p>
          )}
          {error && (
            <p className="classroom-error" role="alert">
              {error}
            </p>
          )}
        </section>

        {/* JOINED CLASSROOMS LIST */}
        <section className="joined-classrooms">
          <div className="classroom-section-heading">
            <h3>Your Joined Classrooms</h3>
            <button
              type="button"
              className="classroom-icon-button"
              onClick={loadClassrooms}
              disabled={loading}
              title="Refresh classrooms"
            >
              <RefreshCw size={16} className={loading ? 'ath-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <p className="classroom-empty">Loading joined classrooms...</p>
          ) : classrooms.length === 0 ? (
            <div className="classroom-empty-state">
              <BookOpen size={28} />
              <p>No classrooms joined yet. Enter a code above to join your first one.</p>
            </div>
          ) : (
            <div className="student-classroom-grid">
              {classrooms.map((classroom) => (
                <article
                  className="student-classroom-card"
                  key={classroom.id}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="student-classroom-icon">
                      <BookOpen size={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4>{classroom.name}</h4>
                      <p>{classroom.description || 'Fitness and wellness classroom'}</p>
                      <span>
                        Teacher: <strong>{classroom.teacher?.name || 'Faculty Coach'}</strong>
                        <span className="classroom-dot">•</span>
                        {classroom.memberCount} members
                        <span className="classroom-dot">•</span>
                        <Award size={12} style={{ display: 'inline', verticalAlign: 'middle', color: '#0f766e' }} /> {classroom.tasksCount || 0} activities
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="ath-btn ath-btn-primary"
                      style={{ padding: '7px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => loadClassroomDetail(classroom.id)}
                      disabled={detailLoading}
                    >
                      Open Classroom & View Tasks →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentAppLayout>
  )
}