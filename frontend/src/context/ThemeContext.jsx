import { createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'athletica-theme'
const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      return saved === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  const applyTheme = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', validTheme)
    document.body.setAttribute('data-theme', validTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme)
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e)
    }
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark'
    setThemeState(validTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
