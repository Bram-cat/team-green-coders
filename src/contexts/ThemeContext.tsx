'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark' // Resolved system preference
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('solarpei-theme') as Theme
    if (saved) {
      setTheme(saved)
    }
  }, [])

  // Apply theme to DOM and handle system preference changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const applyTheme = () => {
      let isDark: boolean

      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDark = theme === 'dark'
      }

      // Remove and add class to ensure it's applied correctly
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      setEffectiveTheme(isDark ? 'dark' : 'light')
    }

    applyTheme()

    // Persist to localStorage
    localStorage.setItem('solarpei-theme', theme)

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
