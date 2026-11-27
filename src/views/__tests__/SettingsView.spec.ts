import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { THEME_STORAGE_KEY } from '@/utils/constants'
import { useThemeStore } from '@/stores/theme'
import SettingsView from '../SettingsView.vue'

vi.mock('@/services/firebase', () => ({ auth: {}, db: {} }))
vi.mock('@/services/authService', () => ({
  logOut: vi.fn(),
  subscribeToAuth: vi.fn(),
}))
vi.mock('@/services/userService', () => ({
  createProfile: vi.fn(),
  getProfile: vi.fn(),
  updateCalorieGoal: vi.fn(),
}))
vi.mock('@/services/foodService', () => ({ listFoods: vi.fn() }))
vi.mock('@/services/entryService', () => ({ listEntriesByDate: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

function mountView() {
  return mount(SettingsView, {
    global: { stubs: { PageHeader: true } },
  })
}

describe('SettingsView appearance', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setActivePinia(createPinia())
  })

  it('offers system, light and dark options labelled Appearance', () => {
    const wrapper = mountView()
    const select = wrapper.get('select')
    expect(wrapper.get('label[for="' + select.attributes('id') + '"]').text()).toBe('Appearance')
    expect(select.findAll('option').map((o) => o.text())).toEqual([
      'System default',
      'Light',
      'Dark',
    ])
  })

  it('shows the current theme preference as selected', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const wrapper = mountView()
    expect(wrapper.get('select').element.value).toBe('dark')
  })

  it('applies and persists dark when the user selects it', async () => {
    const wrapper = mountView()
    await wrapper.get('select').setValue('dark')
    expect(useThemeStore().theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('removes the theme attribute when the user switches back to system', async () => {
    const wrapper = mountView()
    await wrapper.get('select').setValue('light')
    await wrapper.get('select').setValue('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
