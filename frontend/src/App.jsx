import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

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
    return <Navigate to="/community/portal" replace />
  }

  return <Navigate to="/student/dashboard" replace />
}

function CommunityPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <main className="login-page">
      <section className="login-layout">
        <header className="login-header">
          <Link className="login-brand" to="/" aria-label="Athletica home">
            <div className="login-brand-mark">A<span>+</span></div>
            <span>ATHLETICA</span>
          </Link>
        </header>
        <section className="login-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <p className="login-kicker"><span></span> COMMUNITY PORTAL</p>
          <h2>Welcome, {user?.name}!</h2>
          <p className="card-copy">You are successfully signed in as a Community Member ({user?.email}).</p>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Community fitness challenges, peer workouts, and low-connectivity toolsets are active for your account.
          </p>
          <button
            className="sign-in-button"
            style={{ marginTop: '1.5rem' }}
            type="button"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Sign Out
          </button>
        </section>
      </section>
    </main>
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

function StudentSubpageWrapper({ Component }) {
  const navigate = useNavigate()

  return (
    <Component
      onDashboard={() => navigate('/student/dashboard')}
      onWorkoutPlan={() => navigate('/student/workout')}
      onNutrition={() => navigate('/student/nutrition')}
      onWellness={() => navigate('/student/wellness')}
      onProgress={() => navigate('/student/progress')}
      onTalent={() => navigate('/student/talent')}
      onGamification={() => navigate('/student/gamification')}
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

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} redirectTo="/student/login" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/assessment" element={<StudentAssessment />} />
        <Route path="/student/fitness-result" element={<FitnessPassport />} />
        <Route path="/student/workout" element={<StudentSubpageWrapper Component={WorkoutPlan} />} />
        <Route path="/student/nutrition" element={<StudentSubpageWrapper Component={Nutrition} />} />
        <Route path="/student/wellness" element={<StudentSubpageWrapper Component={Wellness} />} />
        <Route path="/student/progress" element={<StudentSubpageWrapper Component={Progress} />} />
        <Route path="/student/talent" element={<StudentSubpageWrapper Component={TalentDiscovery} />} />
        <Route path="/student/gamification" element={<StudentSubpageWrapper Component={Gamification} />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* Protected Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} redirectTo="/teacher/login" />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboardWrapper />} />
      </Route>

      {/* Protected Community Routes */}
      <Route element={<ProtectedRoute allowedRoles={['community']} redirectTo="/community/login" />}>
        <Route path="/community/portal" element={<CommunityPortal />} />
        <Route path="/community/dashboard" element={<CommunityPortal />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
