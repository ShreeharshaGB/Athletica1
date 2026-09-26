import { createContext, useContext, useEffect, useState } from 'react'
import en from '../i18n/en.js'
import kn from '../i18n/kn.js'

const LANG_STORAGE_KEY = 'athletica-language'
const translations = { en, kn }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY)
      return saved === 'kn' ? 'kn' : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language)
    } catch (e) {
      console.warn('Could not save language to localStorage:', e)
    }
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const setLanguage = (newLang) => {
    const validLang = newLang === 'kn' ? 'kn' : 'en'
    setLanguageState(validLang)
  }

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'kn' : 'en'))
  }

  // Translation helper function
  const t = (key, fallback = '') => {
    const currentDict = translations[language] || en
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key]
    }
    // Fallback to English
    if (en && en[key] !== undefined) {
      return en[key]
    }
    return fallback || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isKannada: language === 'kn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
