import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { useLanguage } from '../context/LanguageContext'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function StudentClassrooms() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroomId, setSelectedClassroomId] = useState(classroomId || null)
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
    if (!id) return
    setDetailLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await apiRequest(`/student/classrooms/${id}`)
      setClassroomDetail(res.classroom)
      setSelectedClassroomId(id)
    } catch (err) {
      setError(err.message || 'Could not load classroom details.')
      setClassroomDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    if (classroomId) {
      loadClassroomDetail(classroomId)
    } else {
      setSelectedClassroomId(null)
      setClassroomDetail(null)
    }
  }, [classroomId])

  const handleJoin = async (event) => {
    event.preventDefault()
    if (!code.trim()) {
      setError(t('enter_invite_code', 'Enter the invite code your teacher shared.'))
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
    const targetId = selectedClassroomId || classroomId
    if (!targetId || !taskId) return
    setCompletingTaskId(taskId)
    setError('')
    setMessage('')
    try {
      const res = await apiRequest(`/student/classrooms/${targetId}/tasks/${taskId}/complete`, {
        method: 'POST',
        body: { notes: 'Completed via Athletica Student Portal' },
      })
      setMessage(res.message || 'Challenge completed! Points recorded.')
      // Refresh classroom details
      await loadClassroomDetail(targetId)
    } catch (err) {
      setError(err.message || 'Failed to mark task complete.')
    } finally {
      setCompletingTaskId(null)
    }
  }

  // ==========================================
  // VIEW: SINGLE CLASSROOM DETAIL VIEW
  // ==========================================
  if (selectedClassroomId || classroomId) {
    if (detailLoading) {
      return (
        <StudentAppLayout
          eyebrow={t('student_workspace', 'STUDENT PORTAL')}
          pageTitle={t('loading', 'Loading Classroom...')}
        >
          <div className="classroom-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <RefreshCw size={28} className="ath-spin" style={{ color: 'var(--ath-primary)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--ath-text-muted)' }}>{t('loading', 'Loading classroom details...')}</p>
          </div>
        </StudentAppLayout>
      )
    }

    if (!classroomDetail && error) {
      return (
        <StudentAppLayout
          eyebrow={t('student_workspace', 'STUDENT PORTAL')}
          pageTitle={t('classrooms_title', 'Classroom Access')}
        >
          <div className="classroom-page">
            <button
              type="button"
              className="classroom-back-btn"
              onClick={() => navigate('/student/classrooms')}
            >
              <ArrowLeft size={16} /> {t('back_to_joined_classrooms', 'Back to joined classrooms')}
            </button>
            <div className="classroom-error" style={{ margin: '20px 0', padding: '18px' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem' }}>
                Please join this classroom first using the invite code provided by your instructor.
              </p>
            </div>
          </div>
        </StudentAppLayout>
      )
    }

    const tasks = classroomDetail?.tasks || []
    const members = classroomDetail?.members || []
    const completedTasksCount = tasks.filter((t) => t.hasCompleted).length

    return (
      <StudentAppLayout
        eyebrow={t('student_workspace', 'STUDENT CLASSROOM HUB')}
        pageTitle={classroomDetail?.name || t('classrooms_title', 'Classroom')}
        pageSubtitle={classroomDetail?.description || 'Access assigned tasks, complete physical fitness challenges, and view class peers.'}
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
              navigate('/student/classrooms')
            }}
          >
            <ArrowLeft size={16} /> {t('back_to_joined_classrooms', 'Back to joined classrooms')}
          </button>

          {/* CLASSROOM HERO */}
          <div className="classroom-detail-hero student-hero" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '18px', padding: '24px 28px', color: '#ffffff', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  <BookOpen size={13} /> {t('student_workspace', 'STUDENT CLASSROOM')}
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {classroomDetail?.name}
                </h1>
                <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem', maxWidth: '600px' }}>
                  {classroomDetail?.description || 'Physical training and wellness cohort.'}
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#a5f3fc' }}>
                  Instructor: <strong>{classroomDetail?.teacher?.name || 'Faculty Coach'}</strong> ({classroomDetail?.teacher?.email})
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
                  {t('class_progress', 'YOUR CLASS PROGRESS')}
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#ffffff' }}>
                  {completedTasksCount} / {tasks.length}
                </strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#ccfbf1', marginTop: '2px' }}>
                  {t('tasks_completed', 'Tasks Completed')}
                </span>
              </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#99f6e4" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>{members.length}</strong> {t('enrolled_students', 'Enrolled Students')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#99f6e4" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>{tasks.length}</strong> {t('assigned_activities', 'Assigned Activities')}
                </span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="classroom-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <Award size={16} /> {t('assigned_activities', 'Assigned Challenges')} ({tasks.length})
            </button>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'peers' ? 'active' : ''}`}
              onClick={() => setActiveTab('peers')}
            >
              <Users size={16} /> {t('classmates', 'Classmates')} ({members.length})
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
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ath-dark)' }}>
                  {t('assigned_activities', 'Class Tasks & Challenges')}
                </h3>
              </div>

              {tasks.length === 0 ? (
                <div className="classroom-empty-state" style={{ background: 'var(--ath-surface)', border: '1px dashed var(--ath-border)', borderRadius: '14px', padding: '36px 20px', textAlign: 'center' }}>
                  <Award size={36} color="var(--ath-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>
                    {t('no_tasks_created', 'No tasks have been created for this classroom yet.')}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
                    {t('instructor_will_post', 'Check back soon! Your instructor will post fitness drills, workouts, and team challenges here.')}
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
                          background: 'var(--ath-surface)',
                          border: '1px solid var(--ath-border)',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          borderLeft: isCompleted ? '4px solid #10b981' : '4px solid var(--ath-primary)',
                        }}
                      >
                        <div className="classroom-task-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span className={`task-type-badge ${task.type}`}>
                                {task.type === 'challenge' ? '⚡ Challenge' : task.type === 'workout' ? '🏋️ Workout' : task.type === 'yoga' ? '🧘 Yoga' : '📋 Task'}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ath-primary)' }}>
                                +{task.points} PTS
                              </span>
                              {task.dueDate && (
                                <span style={{ fontSize: '0.72rem', color: isDue ? '#ef4444' : 'var(--ath-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--ath-dark)' }}>
                              {task.title}
                            </h4>
                            <p style={{ margin: 0, color: 'var(--ath-text-muted)', fontSize: '0.85rem', lineHeight: 1.45 }}>
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
                                  background: 'var(--ath-primary-light)',
                                  color: 'var(--ath-primary)',
                                  border: '1px solid var(--ath-primary)',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                }}
                              >
                                <CheckCircle2 size={16} /> {t('completed', 'Completed')}
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
                                {completingTaskId === task.id ? t('submitting', 'Submitting...') : t('mark_completed', 'Mark Completed')}
                              </button>
                            )}
                          </div>
                        </div>

                        {isCompleted && task.completedAt && (
                          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '8px', fontWeight: 600 }}>
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
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ath-dark)' }}>
                  {t('classmates', 'Enrolled Classmates')} ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <div className="classroom-empty-state" style={{ background: 'var(--ath-surface)', border: '1px dashed var(--ath-border)', borderRadius: '14px', padding: '36px 20px', textAlign: 'center' }}>
                  <Users size={36} color="var(--ath-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>
                    {t('no_students_joined', 'No other students enrolled yet.')}
                  </p>
                </div>
              ) : (
                <div className="classroom-roster-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {members.map((member) => (
                    <div className="classroom-student-item" key={member.id} style={{ background: 'var(--ath-surface)', border: '1px solid var(--ath-border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="classroom-student-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                        {(member.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ath-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ath-text-muted)' }}>
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
  // VIEW: MAIN CLASSROOMS LIST & JOIN VIEW
  // ==========================================
  return (
    <StudentAppLayout
      eyebrow={t('student_workspace', 'STUDENT PORTAL')}
      pageTitle={t('classrooms_title', 'Classrooms')}
      pageSubtitle={t('classrooms_subtitle_student', "Join your teacher's physical education groups, open classrooms to view assigned tasks, and complete challenges.")}
    >
      <div className="classroom-page">
        <section className="classroom-hero student-hero">
          <div className="classroom-hero-icon">
            <BookOpen size={25} />
          </div>
          <div>
            <p className="classroom-eyebrow">{t('student_workspace', 'STUDENT CLASSROOM PORTAL')}</p>
            <h2>Connect with your PE teacher and training cohort.</h2>
            <p>
              Enter the unique invite code provided by your instructor to join their class. Complete assigned drills, log verified physical tasks, and earn bonus athletic points!
            </p>
          </div>
        </section>

        <div className="classroom-grid">
          {/* JOIN CLASSROOM */}
          <section className="classroom-panel">
            <div className="classroom-panel-heading">
              <div>
                <LogIn size={18} />
                <h3>{t('join_a_classroom', 'Join a Classroom')}</h3>
              </div>
            </div>
            <form onSubmit={handleJoin} className="classroom-form">
              <label>
                {t('invite_code', 'Classroom Invite Code')}
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder={t('enter_invite_code', 'Enter invite code (e.g. AB12CD34)')}
                  maxLength={16}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
                />
              </label>
              {error && (
                <p className="classroom-error" role="alert">
                  {error}
                </p>
              )}
              {message && <p className="classroom-success">{message}</p>}
              <button type="submit" className="ath-btn ath-btn-primary" disabled={joining}>
                {joining ? <RefreshCw size={16} className="ath-spin" /> : <LogIn size={16} />}
                {joining ? t('joining', 'Joining...') : t('join', 'Join Classroom')}
              </button>
            </form>
          </section>

          {/* JOINED CLASSROOMS */}
          <section className="classroom-panel classroom-list-panel">
            <div className="classroom-panel-heading">
              <div>
                <BookOpen size={18} />
                <h3>{t('joined_classrooms', 'Your Joined Classrooms')}</h3>
              </div>
              <button
                type="button"
                className="classroom-icon-button"
                onClick={loadClassrooms}
                disabled={loading}
                title={t('refresh', 'Refresh classrooms')}
              >
                <RefreshCw size={16} className={loading ? 'ath-spin' : ''} />
              </button>
            </div>
            {loading ? (
              <p className="classroom-empty">{t('loading', 'Loading classrooms...')}</p>
            ) : classrooms.length === 0 ? (
              <p className="classroom-empty">You have not joined any classrooms yet.</p>
            ) : (
              <div className="classroom-cards">
                {classrooms.map((classroom) => (
                  <article className="classroom-card" key={classroom.id}>
                    <div className="classroom-card-top">
                      <div>
                        <h4>{classroom.name}</h4>
                        <p>{classroom.description || 'No description provided.'}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className="classroom-member-count">
                          <Users size={14} /> {classroom.memberCount} {t('classmates', 'peers')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ath-primary)', fontWeight: 700 }}>
                          <Award size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {classroom.tasksCount || 0} {t('assigned_activities', 'activities')}
                        </span>
                      </div>
                    </div>

                    <div className="classroom-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--ath-border)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ath-text-muted)' }}>
                        Teacher: <strong style={{ color: 'var(--ath-dark)' }}>{classroom.teacher?.name || 'Faculty'}</strong>
                      </span>
                      <button
                        type="button"
                        className="ath-btn ath-btn-primary"
                        style={{ padding: '7px 14px', fontSize: '0.78rem' }}
                        onClick={() => navigate(`/student/classrooms/${classroom.id}`)}
                        disabled={detailLoading}
                      >
                        {t('open_classroom', 'Open Classroom')} →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentAppLayout>
  )
}