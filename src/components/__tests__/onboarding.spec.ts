import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { makeStats } from '@/__tests__/fixtures'
import AboutYouForm from '../onboarding/AboutYouForm.vue'
import CalorieTargetPicker from '../onboarding/CalorieTargetPicker.vue'

describe('AboutYouForm', () => {
  // Field order: age, height ft, height in, weight (gender and activity are selects)
  async function fillValid(wrapper: ReturnType<typeof mount>) {
    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('30')
    await inputs[1]?.setValue('5')
    await inputs[2]?.setValue('6')
    await inputs[3]?.setValue('150')
  }

  it('does not submit empty data and shows validation messages', async () => {
    const wrapper = mount(AboutYouForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('between 18 and 100')
    expect(wrapper.text()).toContain('between 60 and 700')
  })

  it('rejects users under 18', async () => {
    const wrapper = mount(AboutYouForm)
    await fillValid(wrapper)
    await wrapper.findAll('input')[0]?.setValue('17')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('rejects out-of-range inches', async () => {
    const wrapper = mount(AboutYouForm)
    await fillValid(wrapper)
    await wrapper.findAll('input')[2]?.setValue('12')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Inches: 0 to 11')
  })

  it('emits body stats with height converted to inches', async () => {
    const wrapper = mount(AboutYouForm)
    await fillValid(wrapper)
    const [gender, activity] = wrapper.findAll('select')
    await gender?.setValue('male')
    await activity?.setValue('active')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { gender: 'male', age: 30, heightIn: 66, weightLb: 150, activityLevel: 'active' },
    ])
  })

  it('prefills from saved stats', () => {
    const wrapper = mount(AboutYouForm, {
      props: { initial: makeStats({ age: 41, heightIn: 70, weightLb: 180 }) },
    })
    const values = wrapper.findAll('input').map((i) => (i.element as HTMLInputElement).value)
    expect(values).toEqual(['41', '5', '10', '180'])
  })
})

describe('CalorieTargetPicker', () => {
  const stats = makeStats() // maintenance 1949

  it('shows the daily calories for the chosen rate', () => {
    const wrapper = mount(CalorieTargetPicker, { props: { stats, modelValue: -1 } })
    expect(wrapper.get('.calories').text()).toBe('1449')
    expect(wrapper.text()).toContain('Lose 1 lb per week')
    expect(wrapper.text()).toContain('−500 kcal/day')
    expect(wrapper.text()).toContain('1949')
  })

  it('shows maintenance and a gain target', () => {
    const maintain = mount(CalorieTargetPicker, { props: { stats, modelValue: 0 } })
    expect(maintain.get('.calories').text()).toBe('1949')
    expect(maintain.text()).toContain('Maintain weight')

    const gain = mount(CalorieTargetPicker, { props: { stats, modelValue: 1 } })
    expect(gain.get('.calories').text()).toBe('2449')
    expect(gain.text()).toContain('+500 kcal/day')
  })

  it('updates the model when the slider moves', async () => {
    const wrapper = mount(CalorieTargetPicker, { props: { stats, modelValue: -1 } })
    await wrapper.get('input[type="range"]').setValue('-2')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([-2])
  })

  it('offers a slider from -2 to +2 lb in half-pound steps', () => {
    const range = mount(CalorieTargetPicker, { props: { stats, modelValue: 0 } }).get(
      'input[type="range"]',
    )
    expect(range.attributes('min')).toBe('-2')
    expect(range.attributes('max')).toBe('2')
    expect(range.attributes('step')).toBe('0.5')
  })

  it('warns and clamps to the safe minimum for low-calorie plans', () => {
    const small = makeStats({ age: 90, weightLb: 100, heightIn: 60, activityLevel: 'sedentary' })
    const wrapper = mount(CalorieTargetPicker, { props: { stats: small, modelValue: -2 } })
    expect(wrapper.get('.calories').text()).toBe('1200')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('does not warn for a normal plan', () => {
    const wrapper = mount(CalorieTargetPicker, { props: { stats, modelValue: -1 } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
