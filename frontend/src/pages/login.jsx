import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Login.css'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'community', label: 'Community Person' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    eye: <><path d="M2.5 12C4.5 8.7 7.7 7 12 7s7.5 1.7 9.5 5-3.2 5-9.5 5-7.5-1.7-9.5-5Z" /><circle cx="12" cy="12" r="2.2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.7-3.2 3-5 7-5s6.3 1.8 7 5" /></>,
    building: <><path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M10 9h4M10 13h4M10 17h4" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function BrandMark() {
  return <div className="login-brand-mark" aria-hidden="true">A<span>+</span></div>
}

export default function Login({ initialRole = 'student', onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('error') // 'error' or 'success'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole)
    }
  }, [initialRole])

  function validateForm() {
    if (isRegistering && !name.trim()) {
      setFeedback('Please enter your full name.')
      setFeedbackType('error')
      return false
    }

    if (!role) {
      setFeedback('Please select your role.')
      setFeedbackType('error')
      return false
    }

    if (!email.trim()) {
      setFeedback('Please enter your email address.')
      setFeedbackType('error')
      return false
    }

    if (!password) {
      setFeedback('Please enter your password.')
      setFeedbackType('error')
      return false
    }

    if (isRegistering && password.length < 6) {
      setFeedback('Password must be at least 6 characters.')
      setFeedbackType('error')
      return false
    }

    if (isRegistering && (role === 'student' || role === 'teacher') && !institutionId.trim()) {
      setFeedback('Please enter your Institution/College ID.')
      setFeedbackType('error')
      return false
    }

    if (isRegistering && role === 'community' && !communityId.trim()) {
      setFeedback('Please enter your Community ID (e.g. MANGALORE-FITNESS).')
      setFeedbackType('error')
      return false
    }

    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    setFeedback('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const payload = isRegistering
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
            ...(role === 'community'
              ? { communityId: communityId.trim().toUpperCase() }
              : { institutionId: institutionId.trim().toUpperCase() }),
          }
        : { email: email.trim().toLowerCase(), password, role }

      const data = await apiRequest(isRegistering ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (isRegistering) {
        setIsRegistering(false)
        setFeedback('Account created successfully! Please sign in with your password.')
        setFeedbackType('success')
        setPassword('')
        setInstitutionId('')
        setCommunityId('')
        return
      }

      if (data.token && data.user) {
        // Authenticate via context
        auth.login(data.token, data.user)

        if (onLogin) {
          onLogin(data.user)
        }

        // Navigate to appropriate dashboard
        const redirectPath = location.state?.from?.pathname
        if (redirectPath && !redirectPath.includes('/login')) {
          navigate(redirectPath, { replace: true })
        } else if (data.user.role === 'teacher') {
          navigate('/teacher/dashboard', { replace: true })
        } else if (data.user.role === 'community') {
          navigate('/community/dashboard', { replace: true })
        } else {
          navigate('/student/dashboard', { replace: true })
        }
      } else {
        setFeedback('Invalid response from server. Please try again.')
        setFeedbackType('error')
      }
    } catch (error) {
      setFeedbackType('error')
      if (error.status === 401) {
        setFeedback('Email or password is incorrect.')
      } else if (error.status === 403) {
        setFeedback('Role does not match this account.')
      } else if (error.status === 409) {
        setFeedback('Email is already registered. Please sign in.')
      } else if (error.status === 400) {
        setFeedback(error.message || 'Please check your information and try again.')
      } else if (!error.status) {
        setFeedback('Unable to connect to Athletica. Please try again.')
      } else {
        setFeedback('Unable to connect to Athletica. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" aria-hidden="true" />
      <div className="login-decoration decoration-two" aria-hidden="true" />
      <div className="login-decoration decoration-three" aria-hidden="true"><span /></div>

      <section className="login-layout" aria-labelledby="login-heading">
        <header className="login-header">
          <Link className="login-brand" to="/" aria-label="Athletica home">
            <BrandMark />
            <span>ATHLETICA</span>
          </Link>
          <span className="header-status">
            <i /> {roleTitle} Portal
          </span>
        </header>

        <div className="login-intro">
          <p className="login-kicker"><span /> {roleTitle.toUpperCase()} PORTAL</p>
          <h1 id="login-heading">Welcome to <em>Athletica</em></h1>
          <p className="login-tagline">Your fitness journey, your way <span>—</span> wherever you are.</p>
        </div>

        <section className="login-card" aria-label="Sign in to Athletica">
          <div className="card-topline">
            <span>{isRegistering ? 'NEW ATHLETE REGISTRATION' : `${roleTitle.toUpperCase()} SIGN IN`}</span>
            <div className="card-mark"><BrandMark /></div>
          </div>
          <h2>{isRegistering ? 'Create your profile.' : 'Let’s get moving.'}</h2>
          <p className="card-copy">
            {isRegistering
              ? 'Join Athletica to start tracking workouts and receiving personalized fitness guidance.'
              : `Sign in to access your ${roleTitle.toLowerCase()} fitness dashboard.`}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {isRegistering && (
              <>
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="input-field">
                  <Icon name="user" size={18} />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => { setName(event.target.value); setFeedback('') }}
                  />
                </div>
              </>
            )}

            <label className="field-label" htmlFor="username">Email Address</label>
            <div className="input-field">
              <Icon name="user" size={18} />
              <input
                id="username"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setFeedback('') }}
              />
            </div>

            <div className="password-heading">
              <label className="field-label" htmlFor="password">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => {
                    setFeedback('Password reset is available by contacting your school or coach.')
                    setFeedbackType('info')
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="input-field">
              <Icon name="lock" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setFeedback('') }}
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>

            {isRegistering && (role === 'student' || role === 'teacher') && (
              <>
                <label className="field-label" htmlFor="institutionId">Institution / College ID</label>
                <div className="input-field">
                  <Icon name="building" size={18} />
                  <input
                    id="institutionId"
                    type="text"
                    placeholder="e.g. COLLEGE-001"
                    value={institutionId}
                    onChange={(event) => { setInstitutionId(event.target.value.toUpperCase()); setFeedback('') }}
                  />
                </div>
              </>
            )}

            {isRegistering && role === 'community' && (
              <>
                <label className="field-label" htmlFor="communityId">Community ID</label>
                <div className="input-field">
                  <Icon name="building" size={18} />
                  <input
                    id="communityId"
                    type="text"
                    placeholder="e.g. MANGALORE-FITNESS"
                    value={communityId}
                    onChange={(event) => { setCommunityId(event.target.value.toUpperCase()); setFeedback('') }}
                  />
                </div>
              </>
            )}

            {feedback && (
              <p
                className="login-feedback"
                role="status"
                style={{
                  background: feedbackType === 'error' ? '#fef2f2' : feedbackType === 'success' ? '#f0fdf4' : '#effaf5',
                  color: feedbackType === 'error' ? '#b91c1c' : feedbackType === 'success' ? '#15803d' : '#157771',
                  border: `1px solid ${feedbackType === 'error' ? '#fecaca' : feedbackType === 'success' ? '#bbf7d0' : '#bceede'}`,
                }}
              >
                {feedback}
              </p>
            )}

            <button
              className="sign-in-button"
              type="submit"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading
                ? (isRegistering ? 'Creating Account...' : 'Signing In...')
                : <>{isRegistering ? 'Create Account' : 'Sign In'} <Icon name="arrow" size={18} /></>}
            </button>
          </form>

          <p className="create-account">
            {isRegistering ? 'Already have an account?' : 'New to Athletica?'}
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setFeedback('')
                setInstitutionId('')
              }}
            >
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </section>

        <footer className="login-footer">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to Welcome</Link>
          <span>© 2026 Athletica • Move well. Live fully.</span>
        </footer>
      </section>
    </main>
  )
}