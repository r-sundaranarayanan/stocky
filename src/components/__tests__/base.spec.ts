import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseAlert from '../base/BaseAlert.vue'
import BaseButton from '../base/BaseButton.vue'
import BaseEmptyState from '../base/BaseEmptyState.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseSlider from '../base/BaseSlider.vue'

describe('BaseButton', () => {
  it('renders its slot as a non-submitting button by default', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toBe('Save')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('supports other variants and types', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'danger', type: 'submit' } })
    expect(wrapper.classes()).toContain('btn-danger')
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('is disabled and shows a spinner while loading', () => {
    const wrapper = mount(BaseButton, { props: { isLoading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn-spinner').exists()).toBe(true)
  })

  it('is disabled when isDisabled is set', () => {
    const wrapper = mount(BaseButton, { props: { isDisabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn-spinner').exists()).toBe(false)
  })

  it('emits click when enabled', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})

describe('BaseInput', () => {
  function mountInput(props: Record<string, unknown> = {}) {
    return mount(BaseInput, {
      props: {
        label: 'Name',
        modelValue: '',
        'onUpdate:modelValue': (value: string | number) =>
          wrapperRef.setProps({ modelValue: value }),
        ...props,
      },
    })
  }
  let wrapperRef: ReturnType<typeof mountInput>

  it('links the label to the input', () => {
    wrapperRef = mountInput()
    const input = wrapperRef.get('input')
    expect(wrapperRef.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(wrapperRef.get('label').text()).toBe('Name')
  })

  it('updates the model with text', async () => {
    wrapperRef = mountInput()
    await wrapperRef.get('input').setValue('Oats')
    expect(wrapperRef.emitted('update:modelValue')?.[0]).toEqual(['Oats'])
  })

  it('converts number inputs to numbers and keeps empty as an empty string', async () => {
    wrapperRef = mountInput({ type: 'number' })
    await wrapperRef.get('input').setValue('12.5')
    expect(wrapperRef.emitted('update:modelValue')?.[0]).toEqual([12.5])
    await wrapperRef.get('input').setValue('')
    expect(wrapperRef.emitted('update:modelValue')?.[1]).toEqual([''])
  })

  it('shows an error message and marks the input invalid', () => {
    wrapperRef = mountInput({ error: 'Required', hint: 'A hint' })
    expect(wrapperRef.get('[role="alert"]').text()).toBe('Required')
    expect(wrapperRef.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapperRef.text()).not.toContain('A hint')
  })

  it('shows the hint when there is no error', () => {
    wrapperRef = mountInput({ hint: 'A hint' })
    expect(wrapperRef.text()).toContain('A hint')
    expect(wrapperRef.find('[role="alert"]').exists()).toBe(false)
  })
})

describe('BaseSelect', () => {
  it('renders options and emits the chosen value', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Unit',
        modelValue: 'g',
        options: [
          { value: 'g', label: 'g' },
          { value: 'ml', label: 'ml' },
        ],
      },
    })
    expect(wrapper.findAll('option')).toHaveLength(2)
    await wrapper.get('select').setValue('ml')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ml'])
  })
})

describe('BaseSlider', () => {
  it('passes range attributes and emits numeric values', async () => {
    const wrapper = mount(BaseSlider, {
      props: { label: 'Rate', modelValue: 0, min: -2, max: 2, step: 0.5, valueText: 'Maintain' },
    })
    const input = wrapper.get('input[type="range"]')
    expect(input.attributes('min')).toBe('-2')
    expect(input.attributes('max')).toBe('2')
    expect(input.attributes('step')).toBe('0.5')
    expect(input.attributes('aria-valuetext')).toBe('Maintain')
    await input.setValue('1.5')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1.5])
  })
})

describe('BaseAlert and BaseEmptyState', () => {
  it('uses role alert for errors and status for success', () => {
    expect(mount(BaseAlert, { slots: { default: 'Oops' } }).attributes('role')).toBe('alert')
    expect(
      mount(BaseAlert, { props: { variant: 'success' }, slots: { default: 'Done' } }).attributes(
        'role',
      ),
    ).toBe('status')
  })

  it('renders the empty state title, optional text and slot', () => {
    const wrapper = mount(BaseEmptyState, {
      props: { title: 'No foods', text: 'Create one' },
      slots: { default: '<button>Go</button>' },
    })
    expect(wrapper.text()).toContain('No foods')
    expect(wrapper.text()).toContain('Create one')
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
