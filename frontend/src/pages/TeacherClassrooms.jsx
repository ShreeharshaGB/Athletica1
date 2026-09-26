import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const [classroomDetail, setClassroomDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'students'

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
    setDetailLoading(true)
    setError('')
    try {
      const res = await apiRequest(`/teacher/classrooms/${id}`)
      setClassroomDetail(res.classroom)
      setSelectedClassroomId(id)
    } catch (err) {
      setError(err.message || 'Could not load classroom details.')
    } finally {
      setDetailLoading(false)
    }
  }

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
      const res = await apiRequest(`/teacher/classrooms/${selectedClassroomId}/tasks`, {
        method: 'POST',
        body: taskForm,
      })
      setTaskMsg(res.message || 'Task assigned successfully!')
      setShowTaskForm(false)
      setTaskForm({ title: '', description: '', type: 'challenge', points: 50, dueDate: '' })
      // Reload detail to see new task
      await loadClassroomDetail(selectedClassroomId)
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
  if (selectedClassroomId && classroomDetail) {
    const isCopied = copiedCode === classroomDetail.inviteCode
    const tasks = classroomDetail.tasks || []
    const members = classroomDetail.members || []

    return (
      <StudentAppLayout
        eyebrow="CLASSROOM MANAGEMENT"
        pageTitle={classroomDetail.name}
        pageSubtitle={classroomDetail.description || 'Manage tasks, assign physical challenges, and track student submissions.'}
      >
        <div className="classroom-page">
          <button
            type="button"
            className="classroom-back-btn"
            onClick={() => {
              setSelectedClassroomId(null)
              setClassroomDetail(null)
            }}
          >
            <ArrowLeft size={16} /> Back to all classrooms
          </button>

          {/* CLASSROOM HERO */}
          <div className="classroom-detail-hero">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  <BookOpen size={13} /> FACULTY CLASSROOM
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  {classroomDetail.name}
                </h1>
                <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem', maxWidth: '600px' }}>
                  {classroomDetail.description || 'Active physical education and wellness classroom space.'}
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
                    STUDENT INVITE CODE
                  </span>
                  <strong style={{ fontSize: '1.3rem', color: '#ffffff', letterSpacing: '0.12em' }}>
                    {classroomDetail.inviteCode}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode(classroomDetail.inviteCode)}
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
                  {isCopied ? <Check size={14} /> : <Clipboard size={14} />} {isCopied ? 'Copied' : 'Copy'}
                </button>
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
                  <strong>{tasks.length}</strong> Assigned Challenges & Tasks
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
              <Award size={16} /> Challenges & Tasks ({tasks.length})
            </button>
            <button
              type="button"
              className={`classroom-tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={16} /> Enrolled Students ({members.length})
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

          {/* TAB 1: CHALLENGES & TASKS */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                  Assigned Activities
                </h3>
                <button
                  type="button"
                  className="ath-btn ath-btn-primary"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> {showTaskForm ? 'Cancel' : 'Assign New Challenge or Task'}
                </button>
              </div>

              {/* TASK ASSIGNMENT FORM */}
              {showTaskForm && (
                <div className="classroom-panel" style={{ marginBottom: '22px', border: '1px solid #0f766e' }}>
                  <div className="classroom-panel-heading">
                    <div>
                      <Plus size={18} />
                      <h3>Create New Classroom Assignment</h3>
                    </div>
                  </div>
                  <form onSubmit={handleAssignTask} className="classroom-form">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                      <label>
                        Task / Challenge Title *
                        <input
                          required
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          placeholder="e.g. 5K Sprint Challenge or 20 Push-ups Daily"
                          maxLength={120}
                        />
                      </label>

                      <label>
                        Activity Category
                        <select
                          value={taskForm.type}
                          onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                          style={{
                            padding: '11px 12px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '9px',
                            font: 'inherit',
                          }}
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
                        Reward XP / Points
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
                        Due Date <span>(optional)</span>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        />
                      </label>
                    </div>

                    <label>
                      Description & Instructions <span>(optional)</span>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Provide details on sets, distance, target time, or form requirements..."
                        rows={3}
                        maxLength={500}
                      />
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="ath-btn ath-btn-secondary"
                        onClick={() => setShowTaskForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ath-btn ath-btn-primary"
                        disabled={taskSubmitting}
                      >
                        {taskSubmitting ? <RefreshCw size={16} className="ath-spin" /> : <Plus size={16} />}
                        {taskSubmitting ? 'Assigning...' : 'Assign to Class'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TASKS LIST */}
              {tasks.length === 0 ? (
                <div className="classroom-empty-state">
                  <Award size={36} color="#94a3b8" />
                  <p style={{ fontWeight: 700, color: '#334155' }}>No tasks or challenges assigned yet.</p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Click "Assign New Challenge or Task" above to publish your first activity to enrolled students.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => {
                    const isDue = task.dueDate ? new Date(task.dueDate) < new Date() : false
                    return (
                      <article className="classroom-task-card" key={task.id}>
                        <div className="classroom-task-header">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span className={`task-type-badge ${task.type}`}>
                                {task.type === 'challenge' ? '⚡ Challenge' : task.type === 'workout' ? '🏋️ Workout' : task.type === 'yoga' ? '🧘 Yoga' : '📋 Task'}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f766e' }}>
                                +{task.points} PTS
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#0f172a' }}>
                              {task.title}
                            </h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.45 }}>
                              {task.description || 'Complete this task to fulfill PE curriculum targets and earn athletic XP.'}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                              {task.completedCount} / {members.length} Completed
                            </div>
                            {task.dueDate && (
                              <div style={{ fontSize: '0.72rem', color: isDue ? '#dc2626' : '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <Clock size={12} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* STUDENT SUBMISSIONS EXPANDER */}
                        {task.completions && task.completions.length > 0 && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                              COMPLETED BY:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              {task.completions.map((comp, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.74rem',
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    color: '#0f172a',
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
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                  Student Roster ({members.length})
                </h3>
              </div>

              {members.length === 0 ? (
                <div className="classroom-empty-state">
                  <Users size={36} color="#94a3b8" />
                  <p style={{ fontWeight: 700, color: '#334155' }}>No students enrolled yet.</p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Share the invite code <strong>{classroomDetail.inviteCode}</strong> with your students so they can join from their portal.
                  </p>
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
                        <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.email}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#0f766e', marginTop: '2px' }}>
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
      eyebrow="FACULTY CLASSROOMS"
      pageTitle="Classrooms"
      pageSubtitle="Create a space for your students, open classrooms to view enrolled students, and assign targeted challenges."
    >
      <div className="classroom-page">
        <section className="classroom-hero">
          <div className="classroom-hero-icon">
            <BookOpen size={25} />
          </div>
          <div>
            <p className="classroom-eyebrow">TEACHER WORKSPACE</p>
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
                <h3>Create Classroom</h3>
              </div>
            </div>
            <form onSubmit={handleCreate} className="classroom-form">
              <label>
                Classroom Name *
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Grade 10 Physical Fitness"
                  maxLength={100}
                />
              </label>
              <label>
                Description <span>(optional)</span>
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
                {submitting ? 'Creating...' : 'Create Classroom'}
              </button>
            </form>
          </section>

          {/* LIST OF CLASSROOMS */}
          <section className="classroom-panel classroom-list-panel">
            <div className="classroom-panel-heading">
              <div>
                <BookOpen size={18} />
                <h3>Your Classrooms</h3>
              </div>
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
            {error && (
              <p className="classroom-error" role="alert">
                {error}
              </p>
            )}
            {loading ? (
              <p className="classroom-empty">Loading classrooms...</p>
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
                            <Users size={14} /> {classroom.memberCount} students
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700 }}>
                            <Award size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {classroom.tasksCount || 0} activities
                          </span>
                        </div>
                      </div>

                      <div className="classroom-code-row">
                        <div>
                          <span>INVITE CODE</span>
                          <strong>{classroom.inviteCode}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => copyCode(classroom.inviteCode)}
                            title="Copy code to clipboard"
                          >
                            {copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            className="ath-btn ath-btn-primary"
                            style={{ padding: '7px 14px', fontSize: '0.78rem' }}
                            onClick={() => loadClassroomDetail(classroom.id)}
                            disabled={detailLoading}
                          >
                            Open Classroom →
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