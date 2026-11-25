import { describe, expect, it } from 'vitest'
import { RouterLinkStub, mount } from '@vue/test-utils'
import { makeEntry, makeFood } from '@/__tests__/fixtures'
import EntryRow from '../diary/EntryRow.vue'
import MealSection from '../diary/MealSection.vue'
import SummaryCard from '../diary/SummaryCard.vue'
import LogFoodDetails from '../food/LogFoodDetails.vue'

const stubs = { global: { stubs: { RouterLink: RouterLinkStub } } }
const nutrition = (calories: number) => ({ calories, protein: 10, carbs: 20, fat: 5 })

describe('SummaryCard for planned food', () => {
  it('shows the planned intake instead of eaten on a future day', () => {
    const wrapper = mount(SummaryCard, {
      props: { totals: nutrition(0), planned: nutrition(600), goal: 2000, isFuture: true },
    })
    const text = wrapper.text()
    expect(text).toContain('Planned calorie intake')
    expect(text).toContain('Planned')
    expect(text).not.toContain('Eaten')
    expect(text).toContain('600')
    expect(text).toContain('1400') // remaining against the goal
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('30')
  })

  it('does not count planned food as eaten on a normal day, but tells the user about it', () => {
    const wrapper = mount(SummaryCard, {
      props: { totals: nutrition(300), planned: nutrition(500), goal: 2000 },
    })
    const text = wrapper.text()
    expect(text).toContain('Eaten')
    expect(text).toContain('1700') // 2000 - 300, planned not subtracted
    expect(text).toContain('500 kcal planned')
    expect(text).not.toContain('Planned calorie intake')
  })

  it('shows no planned note when nothing is planned', () => {
    const wrapper = mount(SummaryCard, { props: { totals: nutrition(300), goal: 2000 } })
    expect(wrapper.text()).not.toContain('planned')
  })
})

describe('EntryRow for planned food', () => {
  it('shows a Planned badge and a confirm button when it can be confirmed', async () => {
    const entry = makeEntry({ status: 'planned' })
    const wrapper = mount(EntryRow, { props: { entry, canConfirm: true }, ...stubs })
    expect(wrapper.text()).toContain('Planned')
    const button = wrapper.get('button.confirm')
    await button.trigger('click')
    expect(wrapper.emitted('confirm')?.[0]).toEqual([entry])
  })

  it('hides the confirm button for future days', () => {
    const wrapper = mount(EntryRow, {
      props: { entry: makeEntry({ status: 'planned' }), canConfirm: false },
      ...stubs,
    })
    expect(wrapper.text()).toContain('Planned')
    expect(wrapper.find('button.confirm').exists()).toBe(false)
  })

  it('shows neither badge nor button for eaten food', () => {
    const wrapper = mount(EntryRow, {
      props: { entry: makeEntry({ status: 'eaten' }), canConfirm: true },
      ...stubs,
    })
    expect(wrapper.text()).not.toContain('Planned')
    expect(wrapper.find('button.confirm').exists()).toBe(false)
  })
})

describe('MealSection with planned food', () => {
  it('shows planned calories separately from eaten ones', () => {
    const wrapper = mount(MealSection, {
      props: {
        label: 'Lunch',
        entries: [
          makeEntry({ id: 'a', status: 'eaten', calories: 200 }),
          makeEntry({ id: 'b', status: 'planned', calories: 300 }),
        ],
      },
      ...stubs,
    })
    expect(wrapper.get('.subtotal').text()).toBe('200 kcal · 300 kcal planned')
  })

  it('shows only the planned amount when nothing is eaten yet', () => {
    const wrapper = mount(MealSection, {
      props: { label: 'Dinner', entries: [makeEntry({ status: 'planned', calories: 450 })] },
      ...stubs,
    })
    expect(wrapper.get('.subtotal').text()).toBe('450 kcal planned')
  })

  it('passes confirm events up with the entry', async () => {
    const entry = makeEntry({ status: 'planned' })
    const wrapper = mount(MealSection, {
      props: { label: 'Lunch', entries: [entry], canConfirm: true },
      ...stubs,
    })
    await wrapper.get('button.confirm').trigger('click')
    expect(wrapper.emitted('confirm')?.[0]).toEqual([entry])
  })
})

describe('LogFoodDetails when planning', () => {
  const props = { food: makeFood(), initialMeal: 'dinner' as const }

  it('explains that the food will be planned and labels the button accordingly', () => {
    const wrapper = mount(LogFoodDetails, { props: { ...props, isPlanned: true } })
    expect(wrapper.text()).toContain('saved as planned')
    expect(wrapper.text()).toContain('Plan food')
    expect(wrapper.text()).not.toContain('Log food')
  })

  it('uses the normal wording for today', () => {
    const wrapper = mount(LogFoodDetails, { props })
    expect(wrapper.text()).toContain('Log food')
    expect(wrapper.text()).not.toContain('saved as planned')
  })

  it('still emits servings and meal when planning', async () => {
    const wrapper = mount(LogFoodDetails, { props: { ...props, isPlanned: true } })
    const button = wrapper.findAll('button').find((b) => b.text() === 'Plan food')
    await button?.trigger('click')
    expect(wrapper.emitted('confirm')?.[0]).toEqual([{ servings: 1, meal: 'dinner' }])
  })
})
