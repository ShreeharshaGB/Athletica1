import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  ClipboardCheck,
  Clock,
  Activity,
  Search,
  Filter,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './teacher_dashboard.css'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentsRes, statsRes] = await Promise.all([
        apiRequest('/teacher/students'),
        apiRequest('/teacher/stats')
      ])
      setStudents(studentsRes.students || [])
      setStats(statsRes || null)
    } catch (err) {
      console.error('Failed to fetch teacher dashboard data:', err)
      setError(err.message || 'Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleViewStudent = async (student) => {
    setSelectedStudent(student)
    setDetailLoading(true)
    try {
      const res = await apiRequest(`/teacher/students/${student.id}`)
      if (res.student) {
        setSelectedStudent(res.student)
      }
    } catch (err) {
      console.error('Error fetching student details:', err)
      // Keep existing student data if detail fetch errors
    } finally {
      setDetailLoading(false)
    }
  }

  // Real-time filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && s.assessmentStatus === 'Completed') ||
        (statusFilter === 'PENDING' && s.assessmentStatus === 'Pending')

      return matchesSearch && matchesStatus
    })
  }, [students, searchQuery, statusFilter])

  // Greeting
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  const teacherName = user?.name || 'Coach'
  const institutionId = user?.institutionId || 'Not Assigned'

  return (
    <StudentAppLayout
      eyebrow="INSTITUTION MANAGEMENT"
      pageTitle={`${greeting}, ${teacherName}`}
      pageSubtitle={`Role: Teacher • Institution ID: ${institutionId}`}
      actions={
        <button
          type="button"
          className="ath-btn ath-btn-secondary"
          onClick={fetchData}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={loading ? 'ath-spin' : ''} />
          Refresh
        </button>
      }
    >
      {/* ERROR STATE */}
      {error && (
        <div
          className="ath-card"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#dc2626" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Failed to load cohort data</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#991b1b' }}>{error}</p>
            </div>
          </div>
          <button
            type="button"
            className="ath-btn ath-btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      {/* OVERVIEW CARDS */}
      <div className="ath-metrics-row" style={{ marginBottom: '28px' }}>
        {/* Total Students */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon blue">
              <Users size={20} />
            </div>
            <span className="ath-badge info">{institutionId}</span>
          </div>
          <div>
            <div className="ath-metric-label">Total Students</div>
            <div className="ath-metric-val">
              {loading ? '—' : stats ? stats.totalStudents : students.length}
            </div>
          </div>
          <div className="ath-metric-subtext">Enrolled in your institution</div>
        </div>

        {/* Assessments Completed */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon teal">
              <ClipboardCheck size={20} />
            </div>
            <span className="ath-badge success">VERIFIED</span>
          </div>
          <div>
            <div className="ath-metric-label">Assessments Completed</div>
            <div className="ath-metric-val">
              {loading
                ? '—'
                : stats
                ? stats.assessmentsCompleted
                : students.filter((s) => s.assessmentStatus === 'Completed').length}
            </div>
          </div>
          <div className="ath-metric-subtext">Logged fitness index tests</div>
        </div>

        {/* Assessments Pending */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon orange">
              <Clock size={20} />
            </div>
            <span className="ath-badge">ACTION NEEDED</span>
          </div>
          <div>
            <div className="ath-metric-label">Assessments Pending</div>
            <div className="ath-metric-val">
              {loading
                ? '—'
                : stats
                ? stats.assessmentsPending
                : students.filter((s) => s.assessmentStatus === 'Pending').length}
            </div>
          </div>
          <div className="ath-metric-subtext">Students awaiting initial test</div>
        </div>

        {/* Average Fitness Score */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon purple">
              <Activity size={20} />
            </div>
            <span className="ath-badge info">COHORT AVG</span>
          </div>
          <div>
            <div className="ath-metric-label">Average Fitness Score</div>
            <div className="ath-metric-val">
              {loading ? (
                '—'
              ) : stats && stats.averageFitnessScore != null ? (
                <>
                  {stats.averageFitnessScore}
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/100</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="ath-metric-subtext">Average score of tested students</div>
        </div>
      </div>

      {/* STUDENTS SECTION */}
      <section id="students" className="ath-card" style={{ gap: '18px' }}>
        <div className="ath-card-header">
          <h2>
            <Users size={20} color="#0f766e" />
            Enrolled Student Athletes
          </h2>
          <span className="ath-badge">
            {loading ? 'LOADING...' : `${filteredStudents.length} ATHLETES`}
          </span>
        </div>

        {/* TOOLBAR: SEARCH & FILTER */}
        <div className="teacher-toolbar">
          <div className="teacher-search-group">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              className="teacher-search-input"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="teacher-filters">
            <Filter size={17} color="#64748b" />
            <select
              className="teacher-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by assessment status"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed Assessment</option>
              <option value="PENDING">Pending Assessment</option>
            </select>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="teacher-state-box">
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid #cbd5e1',
                borderTopColor: '#0f766e',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <p>Loading student roster...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && students.length === 0 && (
          <div className="teacher-state-box">
            <Users size={38} color="#94a3b8" />
            <p style={{ fontWeight: 600, color: '#334155', fontSize: '1rem', marginTop: '12px' }}>
              No students have joined your institution yet.
            </p>
            <p style={{ fontSize: '0.86rem', maxWidth: '420px', margin: '6px 0 0' }}>
              Students can register with your institution code{' '}
              <strong style={{ color: '#0f766e' }}>{institutionId}</strong> to appear in this roster.
            </p>
          </div>
        )}

        {/* NO FILTER MATCHES */}
        {!loading && students.length > 0 && filteredStudents.length === 0 && (
          <div className="teacher-state-box">
            <Search size={32} color="#94a3b8" />
            <p style={{ fontWeight: 600, color: '#334155' }}>
              No students match your search or filter.
            </p>
            <button
              type="button"
              className="ath-btn ath-btn-secondary"
              style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* STUDENTS TABLE */}
        {!loading && filteredStudents.length > 0 && (
          <div className="teacher-table-wrap">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Assessment Status</th>
                  <th>Fitness Score</th>
                  <th>Fitness Level</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const hasAssessment = student.assessmentStatus === 'Completed'
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-meta-col">
                          <div className="student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name-text">{student.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                              Enrolled {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Active'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="student-email-text">{student.email}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${hasAssessment ? 'completed' : 'pending'}`}>
                          {hasAssessment ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {student.fitnessScore != null ? (
                          <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.96rem' }}>
                            {student.fitnessScore}
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>/100</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        {student.fitnessLevel ? (
                          <span className={`status-pill ${student.fitnessLevel.toLowerCase()}`}>
                            {student.fitnessLevel.toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="teacher-action-btn"
                          onClick={() => handleViewStudent(student)}
                          aria-label={`View details for ${student.name}`}
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* STUDENT DETAILS MODAL */}
      {selectedStudent && (
        <div
          className="ath-modal-backdrop"
          onClick={() => setSelectedStudent(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-details-title"
        >
          <div className="ath-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ath-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="student-avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 id="student-details-title">{selectedStudent.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedStudent.email} • {selectedStudent.institutionId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="ath-modal-close-btn"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ath-modal-body">
              {detailLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontSize: '0.88rem' }}>
                  <RefreshCw size={16} className="ath-spin" /> Fetching comprehensive history...
                </div>
              )}

              {/* OVERVIEW SECTION */}
              <div>
                <div className="modal-section-title">Assessment Summary</div>
                <div className="modal-info-grid">
                  <div className="modal-info-card">
                    <div className="label">Status</div>
                    <div className="val">
                      <span className={`status-pill ${selectedStudent.assessmentStatus === 'Completed' ? 'completed' : 'pending'}`}>
                        {selectedStudent.assessmentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-card">
                    <div className="label">Fitness Score</div>
                    <div className="val" style={{ color: '#0f766e' }}>
                      {selectedStudent.fitnessScore != null ? `${selectedStudent.fitnessScore}/100` : 'Not tested'}
                    </div>
                  </div>
                  <div className="modal-info-card">
                    <div className="label">Fitness Level</div>
                    <div className="val">
                      {selectedStudent.fitnessLevel ? (
                        <span className={`status-pill ${selectedStudent.fitnessLevel.toLowerCase()}`}>
                          {selectedStudent.fitnessLevel.toUpperCase()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ATHLETE PROFILE */}
              <div>
                <div className="modal-section-title">Student Profile</div>
                {selectedStudent.profile ? (
                  <div className="modal-info-grid">
                    <div className="modal-info-card">
                      <div className="label">Age</div>
                      <div className="val">{selectedStudent.profile.age} yrs</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Gender</div>
                      <div className="val" style={{ textTransform: 'capitalize' }}>
                        {selectedStudent.profile.gender}
                      </div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Height & Weight</div>
                      <div className="val">
                        {selectedStudent.profile.height} cm / {selectedStudent.profile.weight} kg
                      </div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Fitness Goal</div>
                      <div className="val">{selectedStudent.profile.fitnessGoal}</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Activity Level</div>
                      <div className="val" style={{ textTransform: 'capitalize' }}>
                        {selectedStudent.profile.activityLevel}
                      </div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Diet Preference</div>
                      <div className="val" style={{ textTransform: 'capitalize' }}>
                        {selectedStudent.profile.dietPreference}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.86rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Student has not completed their detailed profile questionnaire yet.
                  </div>
                )}
              </div>

              {/* DETAILED ASSESSMENT EXERCISES */}
              {selectedStudent.latestAssessment && (
                <div>
                  <div className="modal-section-title">
                    Exercise Test Results (
                    {new Date(selectedStudent.latestAssessment.assessmentDate).toLocaleDateString()})
                  </div>
                  <div className="modal-info-grid">
                    <div className="modal-info-card">
                      <div className="label">Push-Ups</div>
                      <div className="val">{selectedStudent.latestAssessment.pushUps} reps</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Sit-Ups</div>
                      <div className="val">{selectedStudent.latestAssessment.sitUps} reps</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">50m Run Time</div>
                      <div className="val">{selectedStudent.latestAssessment.runTime} s</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Flexibility (Sit & Reach)</div>
                      <div className="val">{selectedStudent.latestAssessment.flexibility} cm</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Shuttle Run</div>
                      <div className="val">{selectedStudent.latestAssessment.shuttleRun} s</div>
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORICAL PROGRESS */}
              {selectedStudent.assessmentHistory && selectedStudent.assessmentHistory.length > 1 && (
                <div>
                  <div className="modal-section-title">Historical Assessments</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedStudent.assessmentHistory.map((hist, idx) => (
                      <div
                        key={hist.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.86rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#64748b" />
                          <span>{new Date(hist.assessmentDate).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`status-pill ${hist.fitnessLevel?.toLowerCase() || 'intermediate'}`}>
                            {hist.fitnessLevel?.toUpperCase()}
                          </span>
                          <strong style={{ color: '#0f766e' }}>{hist.overallScore}/100</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ath-modal-footer">
              <button
                type="button"
                className="ath-btn ath-btn-secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}