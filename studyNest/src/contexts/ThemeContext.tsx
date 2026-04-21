'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  mounted: boolean
}

const THEME_STORAGE_KEY = 'studynest-theme'
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === 'system' ? resolveSystemTheme() : theme
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  const html = document.documentElement
  const resolved = resolveTheme(theme)

  html.classList.remove('theme-light', 'theme-dark')
  html.classList.add(resolved === 'dark' ? 'theme-dark' : 'theme-light')
  html.setAttribute('data-theme', resolved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  })
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => resolveSystemTheme())
  const mounted = typeof window !== 'undefined'

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    applyThemeToDom(theme)

    if (theme === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
      if (theme === 'system') {
        applyThemeToDom('system')
      }
    }

    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      mounted,
      setTheme: setThemeState,
      toggleTheme: () => {
        setThemeState((current) => {
          const active = current === 'system' ? resolveSystemTheme() : current
          return active === 'dark' ? 'light' : 'dark'
        })
      },
    }),
    [theme, resolvedTheme, mounted]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
