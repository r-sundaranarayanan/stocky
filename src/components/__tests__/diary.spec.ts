import { describe, expect, it } from 'vitest'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { makeEntry } from '@/__tests__/fixtures'
import MealPicker from '../diary/MealPicker.vue'
import MealSection from '../diary/MealSection.vue'
import SummaryCard from '../diary/SummaryCard.vue'

const totals = (calories: number) => ({ calories, protein: 12, carbs: 30, fat: 5.5 })

describe('SummaryCard', () => {
  it('shows goal, eaten and remaining calories', () => {
    const wrapper = mount(SummaryCard, { props: { totals: totals(500), goal: 2000 } })
    const text = wrapper.text()
    expect(text).toContain('2000')
    expect(text).toContain('500')
    expect(text).toContain('1500')
    expect(text).toContain('Remaining')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('25')
  })

  it('shows macros with one decimal when needed', () => {
    const wrapper = mount(SummaryCard, { props: { totals: totals(500), goal: 2000 } })
    expect(wrapper.text()).toContain('Protein 12g')
    expect(wrapper.text()).toContain('Fat 5.5g')
  })

  it('shows how far over the goal you are and caps the bar at 100%', () => {
    const wrapper = mount(SummaryCard, { props: { totals: totals(2300), goal: 2000 } })
    expect(wrapper.text()).toContain('Over')
    expect(wrapper.text()).toContain('300')
    expect(wrapper.text()).not.toContain('Remaining')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.find('.bar-fill.over').exists()).toBe(true)
  })

  it('hides goal and progress when there is no goal', () => {
    const wrapper = mount(SummaryCard, { props: { totals: totals(500), goal: 0 } })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Goal')
    expect(wrapper.text()).toContain('Eaten')
  })
})

describe('MealPicker', () => {
  it('renders the four meals and marks the selected one', () => {
    const wrapper = mount(MealPicker, { props: { modelValue: 'lunch' } })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map((r) => r.text())).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
    expect(radios[1]?.attributes('aria-checked')).toBe('true')
    expect(radios[0]?.attributes('aria-checked')).toBe('false')
  })

  it('emits the chosen meal', async () => {
    const wrapper = mount(MealPicker, { props: { modelValue: 'lunch' } })
    await wrapper.findAll('[role="radio"]')[3]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['snack'])
  })
})

describe('MealSection', () => {
  const mountSection = (entries: ReturnType<typeof makeEntry>[]) =>
    mount(MealSection, {
      props: { label: 'Lunch', entries },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

  it('shows a placeholder when nothing is logged', () => {
    const wrapper = mountSection([])
    expect(wrapper.text()).toContain('Nothing logged yet')
    expect(wrapper.text()).toContain('0 kcal')
  })

  it('lists entries and the meal subtotal', () => {
    const wrapper = mountSection([
      makeEntry({ id: 'a', foodName: 'Rice', calories: 200, servings: 2 }),
      makeEntry({ id: 'b', foodName: 'Chicken', calories: 150.5 }),
    ])
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Rice')
    expect(wrapper.text()).toContain('Chicken')
    expect(wrapper.text()).toContain('350.5 kcal')
    expect(wrapper.text()).not.toContain('Nothing logged yet')
  })

  it('does not offer a per-meal add button', () => {
    const wrapper = mountSection([])
    expect(wrapper.text()).not.toContain('Add food')
  })

  it('links each entry to its edit page', () => {
    const wrapper = mountSection([makeEntry({ id: 'abc' })])
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({ name: 'entry-edit', params: { id: 'abc' } })
  })
})
