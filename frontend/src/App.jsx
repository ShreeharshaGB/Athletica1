import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import Welcome from './pages/Welcome.jsx'
import RoleSelection from './pages/RoleSelection.jsx'
import Login from './pages/login.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import StudentAssessment from './pages/StudentAssessment.jsx'
import FitnessPassport from './pages/FitnessPassport.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import WorkoutPlan from './pages/workout_plan.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Wellness from './pages/Wellness.jsx'
import Progress from './pages/progress.jsx'
import TeacherDashboard from './pages/teacher_dashboard.jsx'
import Gamification from './pages/gamification.jsx'
import TalentDiscovery from './pages/talent_discovery.jsx'
import PhysiqueAnalysis from './pages/PhysiqueAnalysis.jsx'
import CommunityDashboard from './pages/CommunityDashboard.jsx'
import Coach from './pages/Coach.jsx'
import TeacherClassrooms from './pages/TeacherClassrooms.jsx'
import StudentClassrooms from './pages/StudentClassrooms.jsx'
import CustomWorkoutPlan from './pages/CustomWorkoutPlan.jsx'
import CustomDietPlans from './pages/CustomDietPlans.jsx'
import FormCheck from './pages/FormCheck.jsx'

function DashboardRedirect() {
  const { isAuthenticated, user, isInitializing } = useAuth()

  if (isInitializing) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />
  }

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />
  }

  if (user?.role === 'community') {
    return <Navigate to="/community/dashboard" replace />
  }

  return <Navigate to="/student/dashboard" replace />
}

function CommunityPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <header className="ath-topbar" style={{ padding: '0 32px' }}>
        <Link className="brand" to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="ath-brand-badge">A<span>+</span></div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.08em' }}>ATHLETICA</span>
        </Link>
        <button
          type="button"
          className="ath-btn ath-btn-secondary"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          Sign Out
        </button>
      </header>

      <main className="ath-container" style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px', flex: 1 }}>
        <div className="ath-card" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #065f46 100%)', color: '#ffffff', padding: '32px 36px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
            COMMUNITY & GRASSROOTS WELLNESS
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '14px 0 6px', color: '#ffffff' }}>
            Welcome, {user?.name || 'Community Athlete'}!
          </h1>
          <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.92rem', maxWidth: '600px', lineHeight: 1.55 }}>
            You are signed in to the Athletica Community Portal ({user?.email}). Access accessible fitness guidance built for all environments and activity levels.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e6f7f2', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              👥
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Community Movement Circles</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Connect with peer walking clubs, community calisthenics, and local open-gym fitness challenges.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              📡
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Low-Bandwidth Support</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              All daily workout routines, yoga warm-ups, and dietary checklists are cached locally for offline guidance.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              ❤️
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Everyday Vitality Telemetry</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Track recovery heart rates, daily hydration targets, and simple step goals designed for sustainable lifelong movement.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '24px 32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', background: '#ffffff' }}>
        © 2026 Athletica • Community Health & Wellness
      </footer>
    </div>
  )
}

function TeacherDashboardWrapper() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <TeacherDashboard
      onWorkoutPlan={() => navigate('/student/workout')}
      onNutrition={() => navigate('/student/nutrition')}
      onWellness={() => navigate('/student/wellness')}
      onProgress={() => navigate('/student/progress')}
      onTalent={() => navigate('/student/talent')}
      onGamification={() => navigate('/student/gamification')}
      onLogout={() => {
        logout()
        navigate('/')
      }}
    />
  )
}


function AppRoutes() {
  return (
    <Routes>
      {/* Public Flow */}
      <Route path="/" element={<Welcome />} />
      <Route path="/roles" element={<RoleSelection />} />
      <Route path="/student/login" element={<Login initialRole="student" />} />
      <Route path="/teacher/login" element={<Login initialRole="teacher" />} />
      <Route path="/community/login" element={<Login initialRole="community" />} />
      <Route path="/login" element={<Navigate to="/roles" replace />} />

      {/* Universal Dashboard Redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Protected Student-Only Route */}
      <Route element={<ProtectedRoute allowedRoles={['student']} redirectTo="/student/login" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Shared Personal Fitness Routes (Student & Community & Teacher) */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'community', 'teacher']} redirectTo="/student/login" />}>
        <Route path="/student/physique-analysis" element={<PhysiqueAnalysis />} />
        <Route path="/student/assessment" element={<StudentAssessment />} />
        <Route path="/student/fitness-result" element={<FitnessPassport />} />
        <Route path="/student/workout" element={<WorkoutPlan />} />
        <Route path="/student/form-check" element={<FormCheck />} />
        <Route path="/student/coach" element={<Coach />} />
        <Route path="/student/nutrition" element={<Nutrition />} />
        <Route path="/student/wellness" element={<Wellness />} />
        <Route path="/student/progress" element={<Progress />} />
        <Route path="/student/talent" element={<TalentDiscovery />} />
        <Route path="/student/gamification" element={<Gamification />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/classrooms" element={<StudentClassrooms />} />
        <Route path="/student/classrooms/:classroomId" element={<StudentClassrooms />} />
        <Route path="/student/custom-workout" element={<CustomWorkoutPlan />} />
        <Route path="/student/diet-plans" element={<CustomDietPlans />} />
      </Route>

      {/* Protected Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} redirectTo="/teacher/login" />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classrooms" element={<TeacherClassrooms />} />
        <Route path="/teacher/classrooms/:classroomId" element={<TeacherClassrooms />} />
      </Route>

      {/* Protected Community Routes */}
      <Route element={<ProtectedRoute allowedRoles={['community']} redirectTo="/community/login" />}>
        <Route path="/community/dashboard" element={<CommunityDashboard />} />
        <Route path="/community/portal" element={<Navigate to="/community/dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
