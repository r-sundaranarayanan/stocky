import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateNav from '../diary/DateNav.vue'

describe('DateNav', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0, 0)) // 24 Nov 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mountNav = (modelValue: string) => mount(DateNav, { props: { modelValue } })
  const labelButton = (wrapper: ReturnType<typeof mountNav>) => wrapper.get('button.label')

  it('labels today, yesterday and tomorrow', () => {
    expect(labelButton(mountNav('2026-11-24')).text()).toBe('Today')
    expect(labelButton(mountNav('2026-11-23')).text()).toBe('Yesterday')
    expect(labelButton(mountNav('2026-11-25')).text()).toBe('Tomorrow')
  })

  it('goes to the previous day', async () => {
    const wrapper = mountNav('2026-11-24')
    await wrapper.get('[aria-label="Previous day"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-23'])
  })

  it('goes to the next day, including future days', async () => {
    const wrapper = mountNav('2026-11-24')
    await wrapper.get('[aria-label="Next day"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-25'])
  })

  it('crosses month boundaries', async () => {
    const wrapper = mountNav('2026-12-01')
    await wrapper.get('[aria-label="Previous day"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-30'])
  })

  it('disables the date button on today', () => {
    expect(labelButton(mountNav('2026-11-24')).attributes('disabled')).toBeDefined()
  })

  it('jumps back to today from another day', async () => {
    const wrapper = mountNav('2026-12-10')
    const button = labelButton(wrapper)
    expect(button.attributes('disabled')).toBeUndefined()
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-11-24'])
  })
})
