import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthCard from '../auth/AuthCard.vue'
import AuthDivider from '../auth/AuthDivider.vue'
import GoogleSignInButton from '../auth/GoogleSignInButton.vue'

describe('GoogleSignInButton', () => {
  it('reads "Continue with Google" by default', () => {
    expect(mount(GoogleSignInButton).text()).toContain('Continue with Google')
  })

  it('accepts a different label through the slot', () => {
    const wrapper = mount(GoogleSignInButton, { slots: { default: 'Sign up with Google' } })
    expect(wrapper.text()).toContain('Sign up with Google')
    expect(wrapper.text()).not.toContain('Continue with Google')
  })

  it('is a non-submitting button, so it never submits the email form', () => {
    expect(mount(GoogleSignInButton).attributes('type')).toBe('button')
  })

  it('emits click when pressed', async () => {
    const wrapper = mount(GoogleSignInButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('is disabled while loading and ignores clicks', async () => {
    const wrapper = mount(GoogleSignInButton, { props: { isLoading: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('hides the decorative logo from assistive technology', () => {
    expect(mount(GoogleSignInButton).get('svg').attributes('aria-hidden')).toBe('true')
  })
})

describe('AuthDivider', () => {
  it('says "or" by default and acts as a separator', () => {
    const wrapper = mount(AuthDivider)
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.text()).toBe('or')
  })

  it('accepts other text', () => {
    expect(mount(AuthDivider, { slots: { default: 'and' } }).text()).toBe('and')
  })
})

describe('AuthCard', () => {
  it('shows the title and the body and footer slots', () => {
    const wrapper = mount(AuthCard, {
      props: { title: 'Welcome back' },
      slots: { default: '<form class="form" />', footer: '<a class="footer-link">Help</a>' },
    })
    expect(wrapper.get('h1').text()).toBe('Welcome back')
    expect(wrapper.find('.form').exists()).toBe(true)
    expect(wrapper.find('.footer-link').exists()).toBe(true)
  })

  it('shows the subtitle only when given', () => {
    const without = mount(AuthCard, { props: { title: 'Hi' } })
    expect(without.find('.subtitle').exists()).toBe(false)
    const withSubtitle = mount(AuthCard, { props: { title: 'Hi', subtitle: 'Log in to continue' } })
    expect(withSubtitle.get('.subtitle').text()).toBe('Log in to continue')
  })
})
