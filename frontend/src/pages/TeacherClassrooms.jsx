import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Check,
  Clipboard,
  Plus,
  RefreshCw,
  Users,
  Calendar,
  Award,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  Info,
  ShieldCheck,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { useLanguage } from '../context/LanguageContext'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function TeacherClassrooms() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroomId, setSelectedClassroomId] = useState(classroomId || null)
  const [classroomDetail, setClassroomDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'tasks' | 'students'

  // Classroom creation form
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  // Task assignment form
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'challenge',
    points: 50,
    dueDate: '',
  })
  const [taskSubmitting, setTaskSubmitting] = useState(false)
  const [taskMsg, setTaskMsg] = useState('')

  const loadClassrooms = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/teacher/classrooms')
      setClassrooms(response.classrooms || [])
    } catch (err) {
      setError(err.message || 'Could not load classrooms.')
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
    try {
      const res = await apiRequest(`/teacher/classrooms/${id}`)
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

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Enter a classroom name.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await apiRequest('/teacher/classrooms', {
        method: 'POST',
        body: { name: form.name.trim(), description: form.description.trim() },
      })
      setClassrooms((current) => [response.classroom, ...current])
      setForm({ name: '', description: '' })
    } catch (err) {
      setError(err.message || 'Could not create classroom.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) {
      setError('Enter a task/challenge title.')
      return
    }
    setTaskSubmitting(true)
    setError('')
    setTaskMsg('')
    try {
      const targetId = selectedClassroomId || classroomId
      const res = await apiRequest(`/teacher/classrooms/${targetId}/tasks`, {
        method: 'POST',
        body: taskForm,
      })
      setTaskMsg(res.message || 'Task assigned successfully!')
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', type: 'challenge', points: 50, dueDate: '' })
      // Reload detail to see new task
      await loadClassroomDetail(targetId)
      // Also reload classrooms list for task count
      loadClassrooms()
    } catch (err) {
      setError(err.message || 'Failed to assign task.')
    } finally {
      setTaskSubmitting(false)
    }
  }

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 1800)
  }

  // ==========================================
  // VIEW: SINGLE CLASSROOM DETAIL VIEW
  // ==========================================
  if (selectedClassroomId || classroomId) {
    if (detailLoading) {
      return (
        <StudentAppLayout
          eyebrow={t('teacher_workspace', 'TEACHER WORKSPACE')}
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
          eyebrow={t('teacher_workspace', 'TEACHER WORKSPACE')}
          pageTitle={t('classrooms_title', 'Classroom Access Error')}
        >
          <div className="classroom-page">
            <button
              type="button"
              className="classroom-back-btn"
              onClick={() => navigate('/teacher/classrooms')}
            >
              <ArrowLeft size={16} /> {t('back_to_classrooms', 'Back to all classrooms')}
            </button>
            <div className="classroom-error" style={{ margin: '20px 0', padding: '18px' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem' }}>
                You may only view classrooms created under your teacher account.
              </p>
            </div>
          </div>
        </StudentAppLayout>
      )
    }

    const tasks = classroomDetail?.tasks || []
    const members = classroomDetail?.members || []
    const isCopied = copiedCode === classroomDetail?.inviteCode

    return (
      <StudentAppLayout
        eyebrow={t('teacher_workspace', 'TEACHER WORKSPACE')}
        pageTitle={classroomDetail?.name || t('classrooms_title', 'Classroom Details')}
        pageSubtitle={classroomDetail?.description || 'Manage tasks, assign physical challenges, and track student submissions.'}
      >
        <div className="classroom-page">
          <button
            type="button"
            className="classroom-back-btn"
            onClick={() => {
              setSelectedClassroomId(null)
              setClassroomDetail(null)
              navigate('/teacher/classrooms')
            }}
          >
            <ArrowLeft size={16} /> {t('back_to_classrooms', 'Back to all classrooms')}
          </button>

          {/* CLASSROOM HERO */}
          <div className="classroom-detail-hero" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: '18px', padding: '24px 28px', color: '#ffffff', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  <BookOpen size={13} /> {t('teacher_workspace', 'FACULTY CLASSROOM')}
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {classroomDetail?.name}
                </h1>
                <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem', maxWidth: '600px' }}>
                  {classroomDetail?.description || 'Active physical education and wellness classroom space.'}
                </p>
              </div>

              {/* INVITE CODE BOX */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(4px)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.66rem', color: '#99f6e4', fontWeight: 800, letterSpacing: '0.08em' }}>
                    {t('student_invite_code', 'STUDENT INVITE CODE')}
                  </span>
                  <strong style={{ fontSize: '1.3rem', color: '#ffffff', letterSpacing: '0.12em' }}>
                    {classroomDetail?.inviteCode}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode(classroomDetail?.inviteCode)}
                  style={{
                    background: '#ffffff',
                    color: '#0f766e',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Clipboard size={14} />} {isCopied ? t('copied', 'Copied') : t('copy', 'Copy')}
                </button>
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
              className={`classroom-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Info size={16} /> Overview
            </button>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <Award size={16} /> {t('assigned_activities', 'Tasks & Challenges')} ({tasks.length})
            </button>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={16} /> {t('student_roster', 'Students')} ({members.length})
            </button>
          </div>

          {taskMsg && (
            <div className="classroom-success" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={16} /> {taskMsg}
            </div>
          )}

          {error && (
            <div className="classroom-error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* TAB 0: CLASSROOM OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="ath-card" style={{ gap: '14px' }}>
                <div className="ath-card-header">
                  <h3>
                    <BookOpen size={18} color="var(--ath-primary)" />
                    Classroom Information
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('classroom_name', 'Classroom Name')}
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>{classroomDetail?.name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('classroom_desc', 'Description')}
                    </span>
                    <div style={{ color: 'var(--ath-text)' }}>{classroomDetail?.description || 'No description provided.'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Institution
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>{classroomDetail?.institutionId || 'General'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Created Date
                    </span>
                    <div style={{ color: 'var(--ath-text)' }}>{classroomDetail?.createdAt ? new Date(classroomDetail.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="ath-card" style={{ gap: '14px' }}>
                <div className="ath-card-header">
                  <h3>
                    <ShieldCheck size={18} color="var(--ath-primary)" />
                    Access & Membership
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('invite_code', 'Invite Code')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ath-primary)', background: 'var(--ath-bg)', padding: '4px 10px', borderRadius: '6px' }}>
                        {classroomDetail?.inviteCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCode(classroomDetail?.inviteCode)}
                        className="ath-btn ath-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        {isCopied ? t('copied', 'Copied') : t('copy', 'Copy')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Enrolled Students
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ath-dark)' }}>
                      {members.length} {t('nav_students', 'Students')}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ath-text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Assigned Tasks
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ath-primary)' }}>
                      {tasks.length} {t('assigned_activities', 'Tasks')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CHALLENGES & TASKS */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ath-dark)' }}>
                  {t('assigned_activities', 'Assigned Activities')}
                </h3>
                <button
                  type="button"
                  className="ath-btn ath-btn-primary"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> {showTaskForm ? t('cancel', 'Cancel') : t('assign_new_task', 'Assign New Challenge or Task')}
                </button>
              </div>

              {/* TASK ASSIGNMENT FORM */}
              {showTaskForm && (
                <div className="classroom-panel" style={{ marginBottom: '22px', border: '1px solid var(--ath-primary)' }}>
                  <div className="classroom-panel-heading">
                    <div>
                      <Plus size={18} />
                      <h3>{t('assign_new_task', 'Create New Classroom Assignment')}</h3>
                    </div>
                  </div>
                  <form onSubmit={handleAssignTask} className="classroom-form">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                      <label>
                        {t('task_title', 'Task / Challenge Title')} *
                        <input
                          required
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="e.g. 5K Sprint Challenge or 20 Push-ups Daily"
                          maxLength={120}
                        />
                      </label>

                      <label>
                        {t('activity_category', 'Activity Category')}
                        <select
                          value={taskForm.type}
                          onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                        >
                          <option value="challenge">⚡ Challenge</option>
                          <option value="task">📋 Daily Task</option>
                          <option value="workout">🏋️ Workout Routine</option>
                          <option value="yoga">🧘 Yoga Flow</option>
                          <option value="assessment">🎯 Assessment Drill</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                      <label>
                        {t('reward_xp', 'Reward XP / Points')}
                        <input
                          type="number"
                          min="10"
                          max="1000"
                          step="10"
                          value={taskForm.points}
                          onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })}
                        />
                      </label>

                      <label>
                        {t('due_date', 'Due Date')} <span>(optional)</span>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        />
                      </label>
                    </div>

                    <label>
                      {t('instructions', 'Description & Instructions')} <span>(optional)</span>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Detail performance targets, form guidelines, or completion criteria"
                        rows={3}
                        maxLength={500}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button type="submit" className="ath-btn ath-btn-primary" disabled={taskSubmitting}>
                        {taskSubmitting ? <RefreshCw size={15} className="ath-spin" /> : <Plus size={15} />}
                        {taskSubmitting ? t('submitting', 'Submitting...') : t('assign_new_task', 'Assign to Classroom')}
                      </button>
                      <button
                        type="button"
                        className="ath-btn ath-btn-secondary"
                        onClick={() => setShowTaskForm(false)}
                      >
                        {t('cancel', 'Cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TASKS LIST */}
              {tasks.length === 0 ? (
                <div className="classroom-empty-state" style={{ background: 'var(--ath-surface)', border: '1px dashed var(--ath-border)', borderRadius: '14px', padding: '36px 20px', textAlign: 'center' }}>
                  <Award size={36} color="var(--ath-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>
                    {t('no_tasks_created', 'No tasks have been created for this classroom yet.')}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
                    Click "Assign New Challenge or Task" above to publish drills, fitness challenges, or routines for your students.
                  </p>
                </div>
              ) : (
                <div className="classroom-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => {
                    const isDue = task.dueDate && new Date(task.dueDate) < new Date()
                    return (
                      <article className="classroom-task-card" key={task.id} style={{ background: 'var(--ath-surface)', border: '1px solid var(--ath-border)', borderRadius: '12px', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span className="classroom-task-pill" style={{ textTransform: 'capitalize' }}>
                                {task.type === 'challenge' ? '⚡ Challenge' : task.type === 'workout' ? '🏋️ Workout' : task.type === 'yoga' ? '🧘 Yoga' : '📋 Task'}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ath-primary)' }}>
                                +{task.points} PTS
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--ath-dark)' }}>
                              {task.title}
                            </h4>
                            <p style={{ margin: 0, color: 'var(--ath-text-muted)', fontSize: '0.85rem', lineHeight: 1.45 }}>
                              {task.description || 'Complete this task to fulfill PE curriculum targets and earn athletic XP.'}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', background: 'var(--ath-primary-light)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--ath-primary)' }}>
                              {task.completedCount} / {members.length} {t('completed', 'Completed')}
                            </div>
                            {task.dueDate && (
                              <div style={{ fontSize: '0.72rem', color: isDue ? '#ef4444' : 'var(--ath-text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* STUDENT SUBMISSIONS EXPANDER */}
                        {task.completions && task.completions.length > 0 && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--ath-border)' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--ath-text-muted)', letterSpacing: '0.06em' }}>
                              COMPLETED BY:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              {task.completions.map((comp, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.74rem',
                                    background: 'var(--ath-bg)',
                                    border: '1px solid var(--ath-border)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    color: 'var(--ath-dark)',
                                  }}
                                >
                                  ✓ {comp.student?.name || 'Student'} ({new Date(comp.completedAt).toLocaleDateString()})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENROLLED STUDENTS ROSTER */}
          {activeTab === 'students' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ath-dark)' }}>
                  {t('student_roster', 'Student Roster')} ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <div className="classroom-empty-state" style={{ background: 'var(--ath-surface)', border: '1px dashed var(--ath-border)', borderRadius: '14px', padding: '36px 20px', textAlign: 'center' }}>
                  <Users size={36} color="var(--ath-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 700, color: 'var(--ath-dark)' }}>
                    {t('no_students_joined', 'No students have joined this classroom yet.')}
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
                    {t('share_code_with_students', 'Share the invite code with your students so they can join from their portal.')}
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
                        <div style={{ fontSize: '0.72rem', color: 'var(--ath-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.email}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--ath-primary)', marginTop: '2px' }}>
                          Enrolled: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Active'}
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
  // VIEW: MAIN CLASSROOMS LIST & CREATION VIEW
  // ==========================================
  return (
    <StudentAppLayout
      eyebrow={t('teacher_workspace', 'FACULTY CLASSROOMS')}
      pageTitle={t('classrooms_title', 'Classrooms')}
      pageSubtitle={t('classrooms_subtitle_teacher', 'Create a space for your students, open classrooms to view enrolled students, and assign targeted challenges.')}
    >
      <div className="classroom-page">
        <section className="classroom-hero">
          <div className="classroom-hero-icon">
            <BookOpen size={25} />
          </div>
          <div>
            <p className="classroom-eyebrow">{t('teacher_workspace', 'TEACHER WORKSPACE')}</p>
            <h2>Manage your physical classes and assign challenges.</h2>
            <p>
              Create classrooms for sections, sports teams, or training groups. Click on any classroom to view enrolled students and assign weekly physical challenges and tasks.
            </p>
          </div>
        </section>

        <div className="classroom-grid">
          {/* CREATE CLASSROOM */}
          <section className="classroom-panel">
            <div className="classroom-panel-heading">
              <div>
                <Plus size={18} />
                <h3>{t('create_classroom', 'Create Classroom')}</h3>
              </div>
            </div>
            <form onSubmit={handleCreate} className="classroom-form">
              <label>
                {t('classroom_name', 'Classroom Name')} *
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Grade 10 Physical Fitness"
                  maxLength={100}
                />
              </label>
              <label>
                {t('classroom_desc', 'Description')} <span>(optional)</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Add target sport, curriculum note, or session schedule"
                  rows={4}
                  maxLength={500}
                />
              </label>
              <button type="submit" className="ath-btn ath-btn-primary" disabled={submitting}>
                {submitting ? <RefreshCw size={16} className="ath-spin" /> : <Plus size={16} />}
                {submitting ? t('submitting', 'Creating...') : t('create_classroom', 'Create Classroom')}
              </button>
            </form>
          </section>

          {/* LIST OF CLASSROOMS */}
          <section className="classroom-panel classroom-list-panel">
            <div className="classroom-panel-heading">
              <div>
                <BookOpen size={18} />
                <h3>{t('your_classrooms', 'Your Classrooms')}</h3>
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
            {error && (
              <p className="classroom-error" role="alert">
                {error}
              </p>
            )}
            {loading ? (
              <p className="classroom-empty">{t('loading', 'Loading classrooms...')}</p>
            ) : classrooms.length === 0 ? (
              <p className="classroom-empty">You have not created a classroom yet.</p>
            ) : (
              <div className="classroom-cards">
                {classrooms.map((classroom) => {
                  const copied = copiedCode === classroom.inviteCode
                  return (
                    <article className="classroom-card" key={classroom.id}>
                      <div className="classroom-card-top">
                        <div>
                          <h4>{classroom.name}</h4>
                          <p>{classroom.description || 'No description added.'}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className="classroom-member-count">
                            <Users size={14} /> {classroom.memberCount} {t('nav_students', 'students')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--ath-primary)', fontWeight: 700 }}>
                            <Award size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {classroom.tasksCount || 0} {t('nav_activities', 'activities')}
                          </span>
                        </div>
                      </div>

                      <div className="classroom-code-row">
                        <div>
                          <span>{t('invite_code', 'INVITE CODE')}</span>
                          <strong>{classroom.inviteCode}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => copyCode(classroom.inviteCode)}
                            title="Copy code to clipboard"
                          >
                            {copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? t('copied', 'Copied') : t('copy', 'Copy')}
                          </button>
                          <button
                            type="button"
                            className="ath-btn ath-btn-primary"
                            style={{ padding: '7px 14px', fontSize: '0.78rem' }}
                            onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
                            disabled={detailLoading}
                          >
                            {t('open_classroom', 'Open Classroom')} →
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentAppLayout>
  )
}