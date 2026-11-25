import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { makeFood } from '@/__tests__/fixtures'
import FoodForm from '../food/FoodForm.vue'
import FoodListItem from '../food/FoodListItem.vue'
import LogFoodDetails from '../food/LogFoodDetails.vue'

describe('FoodListItem', () => {
  it('shows name, serving, macros and calories', () => {
    const wrapper = mount(FoodListItem, {
      props: { food: makeFood({ name: 'Oats', calories: 150 }) },
    })
    expect(wrapper.text()).toContain('Oats')
    expect(wrapper.text()).toContain('1 piece')
    expect(wrapper.text()).toContain('150')
  })

  it('emits select with the food when clicked', async () => {
    const food = makeFood()
    const wrapper = mount(FoodListItem, { props: { food } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([food])
  })
})

describe('FoodForm', () => {
  // Field order: name, serving size, calories, protein, carbs, fat
  async function fill(
    wrapper: ReturnType<typeof mount>,
    values: { name?: string; calories?: string },
  ) {
    const inputs = wrapper.findAll('input')
    if (values.name !== undefined) await inputs[0]?.setValue(values.name)
    if (values.calories !== undefined) await inputs[2]?.setValue(values.calories)
  }

  it('does not submit and shows errors when required fields are empty', async () => {
    const wrapper = mount(FoodForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Required')
  })

  it('does not show errors before the first submit', () => {
    const wrapper = mount(FoodForm)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('rejects out-of-range calories', async () => {
    const wrapper = mount(FoodForm)
    await fill(wrapper, { name: 'Lava cake', calories: '99999' })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('between 0 and 10000')
  })

  it('rejects a name longer than 100 characters', async () => {
    const wrapper = mount(FoodForm)
    await fill(wrapper, { name: 'x'.repeat(101), calories: '100' })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('100 characters')
  })

  it('emits trimmed, numeric food input when valid', async () => {
    const wrapper = mount(FoodForm)
    await fill(wrapper, { name: '  Oats  ', calories: '150' })
    await wrapper.findAll('input')[3]?.setValue('5')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      {
        name: 'Oats',
        servingSize: 1,
        servingUnit: 'serving',
        calories: 150,
        protein: 5,
        carbs: 0,
        fat: 0,
      },
    ])
  })

  it('prefills from an existing food and from a suggested name', () => {
    const editing = mount(FoodForm, {
      props: { initial: makeFood({ name: 'Apple', calories: 95 }) },
    })
    const inputs = editing.findAll('input')
    expect((inputs[0]?.element as HTMLInputElement).value).toBe('Apple')
    expect((inputs[2]?.element as HTMLInputElement).value).toBe('95')

    const prefilled = mount(FoodForm, { props: { initialName: 'Pasta' } })
    expect((prefilled.findAll('input')[0]?.element as HTMLInputElement).value).toBe('Pasta')
  })

  it('uses the given submit label and disables while loading', () => {
    const wrapper = mount(FoodForm, { props: { submitLabel: 'Save and add', isLoading: true } })
    const button = wrapper.get('button[type="submit"]')
    expect(button.text()).toContain('Save and add')
    expect(button.attributes('disabled')).toBeDefined()
  })
})

describe('LogFoodDetails', () => {
  const food = makeFood({ name: 'Rice', calories: 200, protein: 4, carbs: 44, fat: 1 })
  const mountDetails = (props: Record<string, unknown> = {}) =>
    mount(LogFoodDetails, { props: { food, initialMeal: 'lunch', ...props } })

  it('defaults to one serving and the initial meal, with a preview', () => {
    const wrapper = mountDetails()
    expect(wrapper.text()).toContain('Rice')
    expect(wrapper.get('input').element.value).toBe('1')
    expect(wrapper.get('[aria-checked="true"]').text()).toBe('Lunch')
    expect(wrapper.get('.preview').text()).toContain('200 kcal')
  })

  it('updates the preview as servings change', async () => {
    const wrapper = mountDetails()
    await wrapper.get('input').setValue('2.5')
    expect(wrapper.get('.preview').text()).toContain('500 kcal')
  })

  it('emits the servings and the selected meal when logging', async () => {
    const wrapper = mountDetails()
    await wrapper.get('input').setValue('2')
    await wrapper.findAll('[role="radio"]')[2]?.trigger('click')
    const logButton = wrapper.findAll('button').find((b) => b.text() === 'Log food')
    await logButton?.trigger('click')
    expect(wrapper.emitted('confirm')?.[0]).toEqual([{ servings: 2, meal: 'dinner' }])
  })

  it('disables logging for invalid servings', async () => {
    const wrapper = mountDetails()
    await wrapper.get('input').setValue('0')
    const logButton = wrapper.findAll('button').find((b) => b.text() === 'Log food')
    expect(logButton?.attributes('disabled')).toBeDefined()
    await logButton?.trigger('click')
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.text()).toContain('between 0 and 100')
  })

  it('shows an error passed from the parent', () => {
    const wrapper = mountDetails({ error: 'Network error' })
    expect(wrapper.text()).toContain('Network error')
  })
})
