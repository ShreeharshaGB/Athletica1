import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles, redirectTo = '/student/login', children }) {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f766e', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />
    }
    if (user.role === 'community') {
      return <Navigate to="/community/portal" replace />
    }
    return <Navigate to="/student/dashboard" replace />
  }

  return children ? children : <Outlet />
}
