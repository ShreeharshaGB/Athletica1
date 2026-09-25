import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

function isValidJwt(token) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return true
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function getStoredSession() {
  try {
    const token = localStorage.getItem('athletica_token')
    const savedUser = localStorage.getItem('athletica_user')
    if (!token || !savedUser) return { user: null, token: null }
    if (!isValidJwt(token)) {
      localStorage.removeItem('athletica_token')
      localStorage.removeItem('athletica_user')
      return { user: null, token: null }
    }
    const user = JSON.parse(savedUser)
    return { user, token }
  } catch {
    localStorage.removeItem('athletica_token')
    localStorage.removeItem('athletica_user')
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getStoredSession())
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Validate session on mount
    const session = getStoredSession()
    setAuthState(session)
    setIsInitializing(false)
  }, [])

  const login = useCallback((token, user) => {
    localStorage.setItem('athletica_token', token)
    localStorage.setItem('athletica_user', JSON.stringify(user))
    setAuthState({ user, token })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('athletica_token')
    localStorage.removeItem('athletica_user')
    setAuthState({ user: null, token: null })
  }, [])

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: Boolean(authState.user && authState.token),
    isInitializing,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
