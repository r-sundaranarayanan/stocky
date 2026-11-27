import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { THEME_STORAGE_KEY } from '@/utils/constants'
import { useThemeStore } from '../theme'

describe('theme store', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setActivePinia(createPinia())
  })

  it('defaults to system and sets no attribute', () => {
    const store = useThemeStore()
    store.init()
    expect(store.theme).toBe('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('applies and persists dark', () => {
    const store = useThemeStore()
    store.setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('removes the attribute when switching back to system', () => {
    const store = useThemeStore()
    store.setTheme('light')
    store.setTheme('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('restores a stored preference on init', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const store = useThemeStore()
    store.init()
    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('ignores invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    expect(useThemeStore().theme).toBe('system')
  })
})
