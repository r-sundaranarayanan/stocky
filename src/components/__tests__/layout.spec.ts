import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import BaseConfirmSheet from '../base/BaseConfirmSheet.vue'
import BaseSheet from '../base/BaseSheet.vue'
import AppShell from '../layout/AppShell.vue'
import PageHeader from '../layout/PageHeader.vue'
import TheTabBar from '../layout/TheTabBar.vue'

const route = vi.hoisted(() => ({ meta: {} as Record<string, unknown> }))
vi.mock('vue-router', () => ({ useRoute: () => route }))

const stubs = { RouterLink: RouterLinkStub, teleport: true }

describe('PageHeader', () => {
  it('shows the title without a back button by default', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Diary' } })
    expect(wrapper.get('h1').text()).toBe('Diary')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits back when the back button is pressed', async () => {
    const wrapper = mount(PageHeader, { props: { title: 'Edit', hasBack: true } })
    await wrapper.get('[aria-label="Go back"]').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('renders the actions slot', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'My Foods' },
      slots: { actions: '<a class="action">+</a>' },
    })
    expect(wrapper.find('.action').exists()).toBe(true)
  })
})

describe('TheTabBar', () => {
  const mountBar = () => mount(TheTabBar, { global: { stubs } })

  it('links to the diary, my foods and settings', () => {
    const links = mountBar().findAllComponents(RouterLinkStub)
    const targets = links.map((l) => l.props('to'))
    expect(targets).toContain('/')
    expect(targets).toContain('/foods')
    expect(targets).toContain('/settings')
  })

  it('shows a Log food link to the log page', () => {
    const wrapper = mountBar()
    const logLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((l) => l.text().includes('Log food'))
    expect(logLink?.props('to')).toEqual({ name: 'log-food' })
  })

  it('puts the Log food bar above the tabs', () => {
    const html = mountBar().html()
    expect(html.indexOf('Log food')).toBeGreaterThan(-1)
    expect(html.indexOf('Log food')).toBeLessThan(html.indexOf('My Foods'))
  })

  it('labels the navigation for assistive technology', () => {
    expect(mountBar().get('nav').attributes('aria-label')).toBe('Main')
  })
})

describe('AppShell', () => {
  beforeEach(() => {
    route.meta = reactive({})
  })

  it('renders the page content', () => {
    const wrapper = mount(AppShell, { slots: { default: '<p>Page</p>' }, global: { stubs } })
    expect(wrapper.text()).toContain('Page')
  })

  it('hides the tab bar on pages without tabs', () => {
    route.meta = { showTabs: false }
    const wrapper = mount(AppShell, { global: { stubs } })
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.find('.has-tabs').exists()).toBe(false)
  })

  it('shows the tab bar on pages that ask for it', () => {
    route.meta = { showTabs: true }
    const wrapper = mount(AppShell, { global: { stubs } })
    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.find('.has-tabs').exists()).toBe(true)
  })
})

describe('BaseSheet', () => {
  const mountSheet = () =>
    mount(BaseSheet, {
      props: { title: 'Delete food?' },
      slots: { default: '<p class="body">Body</p>' },
      global: { stubs: { teleport: true } },
    })

  it('is an accessible modal dialog with a title and content', () => {
    const wrapper = mountSheet()
    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Delete food?')
    expect(wrapper.get('h2').text()).toBe('Delete food?')
    expect(wrapper.find('.body').exists()).toBe(true)
  })

  it('closes when the dimmed background is clicked', async () => {
    const wrapper = mountSheet()
    await wrapper.get('.overlay').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not close when the sheet itself is clicked', async () => {
    const wrapper = mountSheet()
    await wrapper.get('.sheet').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})

describe('BaseConfirmSheet', () => {
  const mountConfirm = (props: Record<string, unknown> = {}) =>
    mount(BaseConfirmSheet, {
      props: { title: 'Delete entry?', message: 'This removes it from your diary.', ...props },
      global: { stubs: { teleport: true } },
    })

  const button = (wrapper: ReturnType<typeof mountConfirm>, text: string) =>
    wrapper.findAll('button').find((b) => b.text() === text)

  it('shows the message and a Delete button by default', () => {
    const wrapper = mountConfirm()
    expect(wrapper.text()).toContain('This removes it from your diary.')
    expect(button(wrapper, 'Delete')).toBeDefined()
  })

  it('uses a custom confirm label', () => {
    expect(button(mountConfirm({ confirmLabel: 'Remove' }), 'Remove')).toBeDefined()
  })

  it('emits confirm and cancel from the matching buttons', async () => {
    const wrapper = mountConfirm()
    await button(wrapper, 'Delete')?.trigger('click')
    await button(wrapper, 'Cancel')?.trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('cancels when the background is clicked', async () => {
    const wrapper = mountConfirm()
    await wrapper.get('.overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('disables the confirm button while loading', () => {
    const wrapper = mountConfirm({ isLoading: true })
    expect(button(wrapper, 'Delete')?.attributes('disabled')).toBeDefined()
  })
})
