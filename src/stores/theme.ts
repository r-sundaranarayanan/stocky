import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ThemePreference } from '@/types'
import { THEME_STORAGE_KEY } from '@/utils/constants'

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

function readStored(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemePreference>(readStored())

  function setTheme(next: ThemePreference) {
    theme.value = next
    applyTheme(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage unavailable (e.g. private mode): the theme still applies for this session.
    }
  }

  function init() {
    applyTheme(theme.value)
  }

  return { theme, setTheme, init }
})
