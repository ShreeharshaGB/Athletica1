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
  Plus,
  Target,
  Trophy,
  Flame,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './teacher_dashboard.css'

// =========================================================================
// DEMO DATA FALLBACK (Presentation-layer only for empty institutions)
// Never inserted into MongoDB, never authenticates, never mixes with security.
// =========================================================================
const DEMO_STUDENTS = [
  {
    id: 'demo-1',
    studentId: 'ATH-10492',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@demo.athletica.edu',
    institutionId: 'DEMO-INST',
    createdAt: '2026-02-15T09:00:00.000Z',
    lastActivityDate: '2026-03-24T14:30:00.000Z',
    assessmentStatus: 'Completed',
    fitnessScore: 78,
    fitnessLevel: 'intermediate',
    profileStatus: 'Complete',
    activityStatus: 'Active',
    activitiesCount: 2,
    pointsEarned: 120,
    needsAttention: false,
    attentionReason: '',
    bmi: 21.4,
    hasPhysiqueAnalysis: true,
    physiqueStatus: 'Physique analysis completed',
    profile: {
      age: 19,
      gender: 'male',
      height: 175,
      weight: 65.5,
      location: 'Main Athletics Track',
      fitnessGoal: 'Speed & Stamina',
      activityLevel: 'intermediate',
      dietPreference: 'vegetarian'
    },
    latestAssessment: {
      id: 'demo-assess-1',
      assessmentDate: '2026-03-20T10:00:00.000Z',
      pushUps: 28,
      sitUps: 32,
      runTime: 12.1,
      flexibility: 24,
      shuttleRun: 10.4,
      overallScore: 78,
      fitnessLevel: 'intermediate'
    },
    joinedActivities: [
      { id: 'demo-act-1', title: '10K Steps Challenge', type: 'challenge', pointsAwarded: 50, status: 'joined', activityStatus: 'Active', joinedAt: '2026-03-18' },
      { id: 'demo-act-2', title: 'Spring Track Meet 2026', type: 'event', pointsAwarded: 70, status: 'joined', activityStatus: 'Active', joinedAt: '2026-03-22' }
    ],
    assessmentHistory: [
      { id: 'demo-h-1', assessmentDate: '2026-03-20T10:00:00.000Z', overallScore: 78, fitnessLevel: 'intermediate', pushUps: 28, sitUps: 32, runTime: 12.1, flexibility: 24, shuttleRun: 10.4 },
      { id: 'demo-h-2', assessmentDate: '2026-02-16T10:00:00.000Z', overallScore: 71, fitnessLevel: 'intermediate', pushUps: 22, sitUps: 26, runTime: 13.0, flexibility: 20, shuttleRun: 11.0 }
    ],
    isDemo: true
  },
  {
    id: 'demo-2',
    studentId: 'ATH-10583',
    name: 'Priya Nair',
    email: 'priya.nair@demo.athletica.edu',
    institutionId: 'DEMO-INST',
    createdAt: '2026-02-18T10:00:00.000Z',
    lastActivityDate: '2026-03-25T11:00:00.000Z',
    assessmentStatus: 'Completed',
    fitnessScore: 92,
    fitnessLevel: 'advanced',
    profileStatus: 'Complete',
    activityStatus: 'Active',
    activitiesCount: 3,
    pointsEarned: 180,
    needsAttention: false,
    attentionReason: '',
    bmi: 20.2,
    hasPhysiqueAnalysis: true,
    physiqueStatus: 'Physique analysis completed',
    profile: {
      age: 18,
      gender: 'female',
      height: 168,
      weight: 57,
      location: 'Varsity Field',
      fitnessGoal: 'Agility & Endurance',
      activityLevel: 'advanced',
      dietPreference: 'balanced'
    },
    latestAssessment: {
      id: 'demo-assess-2',
      assessmentDate: '2026-03-22T08:30:00.000Z',
      pushUps: 35,
      sitUps: 40,
      runTime: 11.2,
      flexibility: 28,
      shuttleRun: 9.6,
      overallScore: 92,
      fitnessLevel: 'advanced'
    },
    joinedActivities: [
      { id: 'demo-act-1', title: '10K Steps Challenge', type: 'challenge', pointsAwarded: 50, status: 'joined', activityStatus: 'Active', joinedAt: '2026-03-19' },
      { id: 'demo-act-3', title: 'Hydration 7-Day Sprint', type: 'challenge', pointsAwarded: 60, status: 'joined', activityStatus: 'Active', joinedAt: '2026-03-21' }
    ],
    isDemo: true
  },
  {
    id: 'demo-3',
    studentId: 'ATH-10641',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@demo.athletica.edu',
    institutionId: 'DEMO-INST',
    createdAt: '2026-03-01T12:00:00.000Z',
    lastActivityDate: '2026-03-01T12:00:00.000Z',
    assessmentStatus: 'Pending',
    fitnessScore: null,
    fitnessLevel: 'beginner',
    profileStatus: 'Complete',
    activityStatus: 'Inactive',
    activitiesCount: 0,
    pointsEarned: 0,
    needsAttention: true,
    attentionReason: 'Assessment not completed',
    bmi: 23.5,
    hasPhysiqueAnalysis: false,
    physiqueStatus: 'Not completed',
    profile: {
      age: 20,
      gender: 'male',
      height: 172,
      weight: 69.5,
      location: 'West Campus Gym',
      fitnessGoal: 'Strength Building',
      activityLevel: 'beginner',
      dietPreference: 'high-protein'
    },
    latestAssessment: null,
    joinedActivities: [],
    isDemo: true
  },
  {
    id: 'demo-4',
    studentId: 'ATH-10729',
    name: 'Ananya Shetty',
    email: 'ananya.shetty@demo.athletica.edu',
    institutionId: 'DEMO-INST',
    createdAt: '2026-02-25T14:00:00.000Z',
    lastActivityDate: '2026-03-21T16:00:00.000Z',
    assessmentStatus: 'Completed',
    fitnessScore: 65,
    fitnessLevel: 'intermediate',
    profileStatus: 'Complete',
    activityStatus: 'Active',
    activitiesCount: 1,
    pointsEarned: 50,
    needsAttention: false,
    attentionReason: '',
    bmi: 21.0,
    hasPhysiqueAnalysis: false,
    physiqueStatus: 'Not completed',
    profile: {
      age: 19,
      gender: 'female',
      height: 162,
      weight: 55,
      location: 'Fitness Center B',
      fitnessGoal: 'General Fitness',
      activityLevel: 'intermediate',
      dietPreference: 'vegetarian'
    },
    latestAssessment: {
      id: 'demo-assess-4',
      assessmentDate: '2026-03-15T11:00:00.000Z',
      pushUps: 18,
      sitUps: 24,
      runTime: 13.8,
      flexibility: 22,
      shuttleRun: 11.4,
      overallScore: 65,
      fitnessLevel: 'intermediate'
    },
    joinedActivities: [
      { id: 'demo-act-1', title: '10K Steps Challenge', type: 'challenge', pointsAwarded: 50, status: 'joined', activityStatus: 'Active', joinedAt: '2026-03-21' }
    ],
    isDemo: true
  },
  {
    id: 'demo-5',
    studentId: 'ATH-10815',
    name: 'Vivek Rao',
    email: 'vivek.rao@demo.athletica.edu',
    institutionId: 'DEMO-INST',
    createdAt: '2026-03-10T15:00:00.000Z',
    lastActivityDate: '2026-03-10T15:00:00.000Z',
    assessmentStatus: 'Pending',
    fitnessScore: null,
    fitnessLevel: 'beginner',
    profileStatus: 'Incomplete',
    activityStatus: 'Inactive',
    activitiesCount: 0,
    pointsEarned: 0,
    needsAttention: true,
    attentionReason: 'Assessment pending & profile incomplete',
    bmi: null,
    hasPhysiqueAnalysis: false,
    physiqueStatus: 'Not completed',
    profile: null,
    latestAssessment: null,
    joinedActivities: [],
    isDemo: true
  }
]

const DEMO_RECENT_ACTIVITIES = [
  { id: 'demo-rec-1', type: 'activity_join', title: 'Joined 10K Steps Challenge', studentName: 'Aarav Sharma', points: 50, date: '2026-03-24T14:30:00.000Z' },
  { id: 'demo-rec-2', type: 'assessment', title: 'Completed physical baseline fitness assessment', studentName: 'Priya Nair', score: 92, date: '2026-03-22T08:30:00.000Z' },
  { id: 'demo-rec-3', type: 'activity_join', title: 'Joined Spring Track Meet 2026', studentName: 'Aarav Sharma', points: 70, date: '2026-03-22T08:00:00.000Z' },
  { id: 'demo-rec-4', type: 'activity_join', title: 'Joined Hydration 7-Day Sprint', studentName: 'Priya Nair', points: 60, date: '2026-03-21T11:00:00.000Z' },
  { id: 'demo-rec-5', type: 'assessment', title: 'Completed physical baseline fitness assessment', studentName: 'Ananya Shetty', score: 65, date: '2026-03-15T11:00:00.000Z' }
]

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [assessmentFilter, setAssessmentFilter] = useState('ALL')
  const [fitnessLevelFilter, setFitnessLevelFilter] = useState('ALL')
  const [activityFilter, setActivityFilter] = useState('ALL')

  // Selected Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Create Activity Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    type: 'challenge',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    points: 50,
  })
  const [activitySubmitting, setActivitySubmitting] = useState(false)
  const [activityError, setActivityError] = useState(null)
  const [activitySuccess, setActivitySuccess] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentsRes, statsRes, activitiesRes] = await Promise.all([
        apiRequest('/teacher/students'),
        apiRequest('/teacher/stats'),
        apiRequest('/teacher/activities')
      ])
      setStudents(studentsRes.students || [])
      setRecentActivities(studentsRes.recentActivities || [])
      setStats(statsRes || null)
      setActivities(activitiesRes.activities || [])
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

  const handleCreateActivity = async (e) => {
    e.preventDefault()
    setActivityError(null)
    setActivitySuccess(null)

    if (!activityForm.title.trim()) {
      setActivityError('Title is required')
      return
    }
    if (!activityForm.startDate || !activityForm.endDate) {
      setActivityError('Start and end dates are required')
      return
    }
    if (new Date(activityForm.startDate) > new Date(activityForm.endDate)) {
      setActivityError('Start date must be before or equal to end date')
      return
    }
    if (Number(activityForm.points) <= 0) {
      setActivityError('Points must be greater than 0')
      return
    }

    setActivitySubmitting(true)
    try {
      await apiRequest('/teacher/activities', {
        method: 'POST',
        body: JSON.stringify({
          title: activityForm.title.trim(),
          description: activityForm.description.trim(),
          type: activityForm.type,
          startDate: activityForm.startDate,
          endDate: activityForm.endDate,
          points: Number(activityForm.points),
        }),
      })
      setActivitySuccess('Activity created successfully!')
      setActivityForm({
        title: '',
        description: '',
        type: 'challenge',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        points: 50,
      })
      // Refresh activities
      const updated = await apiRequest('/teacher/activities')
      setActivities(updated.activities || [])
      setTimeout(() => {
        setCreateModalOpen(false)
        setActivitySuccess(null)
      }, 1000)
    } catch (err) {
      setActivityError(err.message || 'Failed to create activity')
    } finally {
      setActivitySubmitting(false)
    }
  }

  const handleViewStudent = async (student) => {
    setSelectedStudent(student)
    if (student.isDemo) {
      return
    }
    setDetailLoading(true)
    try {
      const res = await apiRequest(`/teacher/students/${student.id}`)
      if (res.student) {
        setSelectedStudent(res.student)
      }
    } catch (err) {
      console.error('Error fetching student details:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  // =========================================================================
  // DEMO DATA SELECTION & METRICS
  // =========================================================================
  const isUsingDemo = !loading && students.length === 0
  const displayStudents = isUsingDemo ? DEMO_STUDENTS : students

  const displayStats = isUsingDemo
    ? {
        totalStudents: 5,
        assessmentsCompleted: 3,
        assessmentsPending: 2,
        activeStudents: 3,
        needsAttention: 2,
        averageFitnessScore: 78.3
      }
    : {
        totalStudents: stats?.totalStudents ?? students.length,
        assessmentsCompleted: stats?.assessmentsCompleted ?? students.filter(s => s.assessmentStatus === 'Completed').length,
        assessmentsPending: stats?.assessmentsPending ?? students.filter(s => s.assessmentStatus === 'Pending').length,
        activeStudents: stats?.activeStudents ?? students.filter(s => s.activityStatus === 'Active').length,
        needsAttention: stats?.needsAttention ?? students.filter(s => s.needsAttention).length,
        averageFitnessScore: stats?.averageFitnessScore ?? null
      }

  const displayRecentActivities = (recentActivities && recentActivities.length > 0)
    ? recentActivities
    : (isUsingDemo ? DEMO_RECENT_ACTIVITIES : [])

  const needsAttentionList = displayStudents.filter(s => s.needsAttention)

  // Real-time multi-field search & filtering
  const filteredStudents = useMemo(() => {
    return displayStudents.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const studentIdStr = (s.studentId || '').toLowerCase()
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        studentIdStr.includes(q)

      const matchesAssessment =
        assessmentFilter === 'ALL' ||
        (assessmentFilter === 'COMPLETED' && s.assessmentStatus === 'Completed') ||
        (assessmentFilter === 'PENDING' && s.assessmentStatus === 'Pending')

      const matchesFitnessLevel =
        fitnessLevelFilter === 'ALL' ||
        (s.fitnessLevel && s.fitnessLevel.toLowerCase() === fitnessLevelFilter.toLowerCase())

      const matchesActivity =
        activityFilter === 'ALL' ||
        (activityFilter === 'ACTIVE' && s.activityStatus === 'Active') ||
        (activityFilter === 'INACTIVE' && s.activityStatus === 'Inactive')

      return matchesSearch && matchesAssessment && matchesFitnessLevel && matchesActivity
    })
  }, [displayStudents, searchQuery, assessmentFilter, fitnessLevelFilter, activityFilter])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="ath-btn ath-btn-primary"
            onClick={() => {
              setActivityError(null)
              setActivitySuccess(null)
              setCreateModalOpen(true)
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Create Activity
          </button>
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
        </div>
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

      {/* 1. TEACHER OVERVIEW CARDS (Total, Assessments, Active, Needs Attention) */}
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
              {loading ? '—' : displayStats.totalStudents}
            </div>
          </div>
          <div className="ath-metric-subtext">
            {isUsingDemo ? 'Demo preview dataset' : 'Enrolled in your institution'}
          </div>
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
              {loading ? '—' : displayStats.assessmentsCompleted}
            </div>
          </div>
          <div className="ath-metric-subtext">Logged fitness index tests</div>
        </div>

        {/* Active Students */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon purple">
              <Flame size={20} />
            </div>
            <span className="ath-badge info">ENGAGED</span>
          </div>
          <div>
            <div className="ath-metric-label">Active Students</div>
            <div className="ath-metric-val">
              {loading ? '—' : displayStats.activeStudents}
            </div>
          </div>
          <div className="ath-metric-subtext">Assessed or challenge participants</div>
        </div>

        {/* Students Needing Attention */}
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon orange">
              <Clock size={20} />
            </div>
            <span className="ath-badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}>
              ACTION NEEDED
            </span>
          </div>
          <div>
            <div className="ath-metric-label">Needs Attention</div>
            <div className="ath-metric-val" style={{ color: displayStats.needsAttention > 0 ? '#ea580c' : 'inherit' }}>
              {loading ? '—' : displayStats.needsAttention}
            </div>
          </div>
          <div className="ath-metric-subtext">Pending tests or inactive profiles</div>
        </div>
      </div>

      {/* 2. ENROLLED STUDENTS SECTION (Search + Filters + Table) */}
      <section id="students" className="ath-card" style={{ gap: '18px', marginBottom: '28px' }}>
        <div className="ath-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#0f766e" />
            <h2 style={{ margin: 0 }}>Enrolled Student Athletes</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isUsingDemo && (
              <span className="ath-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                DEMO DATA PREVIEW
              </span>
            )}
            <span className="ath-badge">
              {loading ? 'LOADING...' : `${filteredStudents.length} ATHLETES`}
            </span>
          </div>
        </div>

        {/* TOOLBAR: SEARCH & MULTI-FILTERS */}
        <div className="teacher-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Prominent Search */}
          <div className="teacher-search-group" style={{ flex: '1 1 280px', minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              className="teacher-search-input"
              placeholder="Search students by name, email, or ID..."
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

          {/* Filters: Assessment, Fitness Level, Activity */}
          <div className="teacher-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {/* Assessment Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="#64748b" />
              <select
                className="teacher-filter-select"
                value={assessmentFilter}
                onChange={(e) => setAssessmentFilter(e.target.value)}
                aria-label="Filter by assessment status"
              >
                <option value="ALL">All Assessments</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Fitness Level Filter */}
            <select
              className="teacher-filter-select"
              value={fitnessLevelFilter}
              onChange={(e) => setFitnessLevelFilter(e.target.value)}
              aria-label="Filter by fitness level"
            >
              <option value="ALL">All Fitness Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Activity Status Filter */}
            <select
              className="teacher-filter-select"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              aria-label="Filter by activity status"
            >
              <option value="ALL">All Activity</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive (No recent activity)</option>
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

        {/* NO FILTER MATCHES */}
        {!loading && displayStudents.length > 0 && filteredStudents.length === 0 && (
          <div className="teacher-state-box">
            <Search size={32} color="#94a3b8" />
            <p style={{ fontWeight: 600, color: '#334155' }}>
              No students match your search or filters.
            </p>
            <button
              type="button"
              className="ath-btn ath-btn-secondary"
              style={{ marginTop: '12px', padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={() => {
                setSearchQuery('')
                setAssessmentFilter('ALL')
                setFitnessLevelFilter('ALL')
                setActivityFilter('ALL')
              }}
            >
              Clear all filters
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
                  <th>Student ID</th>
                  <th>Fitness Level & Score</th>
                  <th>Assessment</th>
                  <th>Activity Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const hasAssessment = student.assessmentStatus === 'Completed'
                  const isActive = student.activityStatus === 'Active'

                  return (
                    <tr key={student.id}>
                      {/* 1. Student Name & Email */}
                      <td>
                        <div className="student-meta-col">
                          <div className="student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name-text">{student.name}</div>
                            <div className="student-email-text" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Student ID */}
                      <td>
                        <span className="id-badge">{student.studentId || 'ATH-N/A'}</span>
                      </td>

                      {/* 3. Fitness Level & Score */}
                      <td>
                        {hasAssessment ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`status-pill ${student.fitnessLevel?.toLowerCase() || 'intermediate'}`}>
                              {student.fitnessLevel?.toUpperCase()}
                            </span>
                            <strong style={{ color: '#0f766e', fontSize: '0.9rem' }}>
                              {student.fitnessScore}/100
                            </strong>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>— Not tested</span>
                        )}
                      </td>

                      {/* 4. Assessment Status */}
                      <td>
                        <span className={`status-pill ${hasAssessment ? 'completed' : 'pending'}`}>
                          {hasAssessment ? 'Completed' : 'Pending'}
                        </span>
                      </td>

                      {/* 5. Activity Status */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                            ● {student.activityStatus}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            ({student.activitiesCount || 0} joined)
                          </span>
                        </div>
                      </td>

                      {/* 6. Action */}
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

      {/* 3. TWO-COLUMN: STUDENTS NEEDING ATTENTION & RECENT ACTIVITY */}
      <div className="teacher-two-col">
        {/* LEFT COLUMN: STUDENTS NEEDING ATTENTION */}
        <section id="needs-attention" className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#ea580c" />
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Students Needing Attention</h2>
            </div>
            <span className="ath-badge" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' }}>
              {needsAttentionList.length} ACTIONABLE
            </span>
          </div>

          {needsAttentionList.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#0f766e' }}>
                All enrolled students are currently active with complete baseline assessments!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {needsAttentionList.map((st) => (
                <div key={st.id} className="attention-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="student-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                      {st.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{st.name}</span>
                        <span className="id-badge" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>{st.studentId}</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#ea580c', fontWeight: 600 }}>
                        ● {st.attentionReason || 'Assessment not completed'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="teacher-action-btn"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => handleViewStudent(st)}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: RECENT STUDENT ACTIVITY */}
        <section id="recent-activity" className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#0f766e" />
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Recent Student Activity</h2>
            </div>
            <span className="ath-badge info">LIVE COHORT</span>
          </div>

          {displayRecentActivities.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              <Clock size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                No recent activity logged yet in your institution cohort.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayRecentActivities.map((item) => (
                <div key={item.id} className="activity-feed-item">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: item.type === 'assessment' ? '#ecfdf5' : '#f5f3ff',
                    color: item.type === 'assessment' ? '#0f766e' : '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700
                  }}>
                    {item.type === 'assessment' ? '🎯' : '⚡'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{item.studentName}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {item.title}
                      {item.score != null && ` • Score: ${item.score}/100`}
                      {item.points != null && ` • +${item.points} PTS`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 4. ACTIVITIES & CHALLENGES SECTION */}
      <section id="activities" className="ath-card" style={{ gap: '18px', marginBottom: '28px' }}>
        <div className="ath-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="#0f766e" />
            <h2 style={{ margin: 0 }}>Institution Activities & Challenges</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="ath-badge">
              {loading ? 'LOADING...' : `${activities.length} CREATED`}
            </span>
            <button
              type="button"
              className="ath-btn ath-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setActivityError(null)
                setActivitySuccess(null)
                setCreateModalOpen(true)
              }}
            >
              <Plus size={15} />
              Create Activity
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="teacher-state-box">
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #cbd5e1',
                borderTopColor: '#0f766e',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <p>Loading activities...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && activities.length === 0 && (
          <div className="teacher-state-box">
            <Target size={38} color="#94a3b8" />
            <p style={{ fontWeight: 600, color: '#334155', fontSize: '1rem', marginTop: '12px' }}>
              No activities or challenges created yet.
            </p>
            <p style={{ fontSize: '0.86rem', maxWidth: '420px', margin: '6px 0 16px' }}>
              Create an athletic challenge or sporting event for students enrolled in {institutionId}.
            </p>
            <button
              type="button"
              className="ath-btn ath-btn-primary"
              onClick={() => {
                setActivityError(null)
                setActivitySuccess(null)
                setCreateModalOpen(true)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Create First Activity
            </button>
          </div>
        )}

        {/* ACTIVITIES GRID */}
        {!loading && activities.length > 0 && (
          <div className="teacher-activity-grid">
            {activities.map((act) => {
              const statusClass = act.status ? act.status.toLowerCase() : 'active'
              const isEvent = act.type === 'event'
              return (
                <div key={act.id} className="teacher-activity-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span className={`activity-badge ${isEvent ? 'event' : 'challenge'}`}>
                        {isEvent ? '📅 Event' : '⚡ Challenge'}
                      </span>
                      <span className={`activity-status-badge ${statusClass}`}>
                        ● {act.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                      {act.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                      {act.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} color="#0f766e" />
                        {new Date(act.startDate).toLocaleDateString()} - {new Date(act.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#0f766e' }}>
                        <Award size={14} />
                        {act.points} PTS
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                        <Users size={14} color="#64748b" />
                        <strong>{act.participantCount || 0}</strong> {act.participantCount === 1 ? 'participant' : 'participants'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {act.institutionId}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* =====================================================================
          STUDENT DETAILS MODAL (Profile, Fitness, Activity, AI Insights)
         ===================================================================== */}
      {selectedStudent && (
        <div
          className="ath-modal-backdrop"
          onClick={() => setSelectedStudent(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-details-title"
        >
          <div className="ath-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="ath-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="student-avatar" style={{ width: '44px', height: '44px', fontSize: '1.2rem' }}>
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 id="student-details-title" style={{ margin: 0 }}>{selectedStudent.name}</h3>
                    <span className="id-badge">{selectedStudent.studentId || 'ATH-N/A'}</span>
                    {selectedStudent.isDemo && (
                      <span className="ath-badge" style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e' }}>DEMO</span>
                    )}
                  </div>
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

            <div className="ath-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {detailLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontSize: '0.88rem' }}>
                  <RefreshCw size={16} className="ath-spin" /> Fetching real-time records...
                </div>
              )}

              {/* 1. FITNESS ASSESSMENT SUMMARY */}
              <div>
                <div className="modal-section-title">Physical Fitness Assessment</div>
                <div className="modal-info-grid">
                  <div className="modal-info-card">
                    <div className="label">Assessment Status</div>
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
                    <div className="val" style={{ textTransform: 'capitalize' }}>
                      {selectedStudent.fitnessLevel || 'Pending'}
                    </div>
                  </div>
                  <div className="modal-info-card">
                    <div className="label">BMI Index</div>
                    <div className="val">
                      {selectedStudent.bmi != null ? `${selectedStudent.bmi} kg/m²` : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. EXERCISE TEST RESULTS (If assessment exists) */}
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
                      <div className="label">Flexibility</div>
                      <div className="val">{selectedStudent.latestAssessment.flexibility} cm</div>
                    </div>
                    <div className="modal-info-card">
                      <div className="label">Shuttle Run</div>
                      <div className="val">{selectedStudent.latestAssessment.shuttleRun} s</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STUDENT PROFILE METRICS */}
              <div>
                <div className="modal-section-title">Athlete Profile & Habits</div>
                {selectedStudent.profile ? (
                  <div className="modal-info-grid">
                    <div className="modal-info-card">
                      <div className="label">Age & Gender</div>
                      <div className="val" style={{ textTransform: 'capitalize' }}>
                        {selectedStudent.profile.age ? `${selectedStudent.profile.age} yrs • ` : ''}
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
                    <div className="modal-info-card">
                      <div className="label">Profile Status</div>
                      <div className="val">
                        <span className={`status-pill ${selectedStudent.profileStatus === 'Complete' ? 'completed' : 'pending'}`}>
                          {selectedStudent.profileStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.86rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Student has not completed their detailed profile questionnaire yet.
                  </div>
                )}
              </div>

              {/* 4. ACTIVITY & CHALLENGES PARTICIPATION */}
              <div>
                <div className="modal-section-title">Institutional Challenges & Events</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div className="modal-info-card">
                    <div className="label">Activities Joined</div>
                    <div className="val">{selectedStudent.activitiesJoinedCount ?? (selectedStudent.joinedActivities?.length || 0)}</div>
                  </div>
                  <div className="modal-info-card">
                    <div className="label">Challenge Points Earned</div>
                    <div className="val" style={{ color: '#0f766e' }}>+{selectedStudent.pointsEarned || 0} PTS</div>
                  </div>
                </div>

                {selectedStudent.joinedActivities && selectedStudent.joinedActivities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedStudent.joinedActivities.map((act, idx) => (
                      <div
                        key={act.id || idx}
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
                          <span style={{ fontSize: '1rem' }}>{act.type === 'event' ? '📅' : '⚡'}</span>
                          <div>
                            <strong>{act.title}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Joined {act.joinedAt ? new Date(act.joinedAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>
                        <span className="ath-badge success">+{act.pointsAwarded || 0} PTS</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem', color: '#64748b' }}>
                    No institutional activities joined yet.
                  </div>
                )}
              </div>

              {/* 5. AI INSIGHTS STATUS (PRIVACY-COMPLIANT) */}
              <div>
                <div className="modal-section-title">AI Physical Insights</div>
                <div style={{
                  padding: '14px 16px',
                  background: selectedStudent.hasPhysiqueAnalysis ? '#ecfdf5' : '#f8fafc',
                  border: selectedStudent.hasPhysiqueAnalysis ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <ShieldCheck size={22} color={selectedStudent.hasPhysiqueAnalysis ? '#059669' : '#64748b'} />
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: selectedStudent.hasPhysiqueAnalysis ? '#065f46' : '#334155' }}>
                      {selectedStudent.hasPhysiqueAnalysis ? 'AI Physique Insights Available' : 'No Physique Analysis Logged'}
                    </strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: selectedStudent.hasPhysiqueAnalysis ? '#047857' : '#64748b', lineHeight: 1.4 }}>
                      {selectedStudent.hasPhysiqueAnalysis
                        ? 'Physique analysis completed. Institutional fitness benchmarks are calibrated. In compliance with student privacy regulations, private body scans remain strictly confidential to the athlete.'
                        : 'Student has not submitted a physique analysis baseline. Encouraging completion helps establish body composition metrics.'}
                    </p>
                  </div>
                </div>
              </div>
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

      {/* =====================================================================
          CREATE ACTIVITY MODAL
         ===================================================================== */}
      {createModalOpen && (
        <div
          className="ath-modal-backdrop"
          onClick={() => !activitySubmitting && setCreateModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-activity-title"
        >
          <div className="ath-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="ath-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f766e' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 id="create-activity-title" style={{ margin: 0, fontSize: '1.1rem' }}>Create Activity or Event</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Institution: <strong style={{ color: '#0f766e' }}>{institutionId}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="ath-modal-close-btn"
                onClick={() => !activitySubmitting && setCreateModalOpen(false)}
                aria-label="Close dialog"
                disabled={activitySubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateActivity}>
              <div className="ath-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activityError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>
                    {activityError}
                  </div>
                )}
                {activitySuccess && (
                  <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#047857', fontSize: '0.85rem' }}>
                    {activitySuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="act-title">Title *</label>
                  <input
                    id="act-title"
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. 10K Steps Challenge"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="act-desc">Description</label>
                  <textarea
                    id="act-desc"
                    className="form-textarea"
                    placeholder="Complete 10,000 steps per day for peak athletic endurance."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="act-type">Type</label>
                    <select
                      id="act-type"
                      className="form-select"
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                    >
                      <option value="challenge">Challenge</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="act-points">Points (XP) *</label>
                    <input
                      id="act-points"
                      className="form-input"
                      type="number"
                      min="1"
                      required
                      value={activityForm.points}
                      onChange={(e) => setActivityForm({ ...activityForm, points: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="act-start">Start Date *</label>
                    <input
                      id="act-start"
                      className="form-input"
                      type="date"
                      required
                      value={activityForm.startDate}
                      onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="act-end">End Date *</label>
                    <input
                      id="act-end"
                      className="form-input"
                      type="date"
                      required
                      value={activityForm.endDate}
                      onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="ath-modal-footer">
                <button
                  type="button"
                  className="ath-btn ath-btn-secondary"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={activitySubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ath-btn ath-btn-primary"
                  disabled={activitySubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {activitySubmitting && <RefreshCw size={14} className="ath-spin" />}
                  {activitySubmitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}