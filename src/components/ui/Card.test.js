import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'

describe('Card', () => {
  it('renders default slot content in card-body', () => {
    const wrapper = mount(Card, { slots: { default: '<p class="test-content">Hello</p>' } })
    expect(wrapper.find('.card-body').exists()).toBe(true)
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('renders title when provided', () => {
    const wrapper = mount(Card, { props: { title: 'My Title' } })
    expect(wrapper.find('.card-title').text()).toBe('My Title')
  })

  it('does not render card-header when no title and no header slot', () => {
    const wrapper = mount(Card)
    expect(wrapper.find('.card-header').exists()).toBe(false)
  })

  it('renders header slot and overrides title', () => {
    const wrapper = mount(Card, {
      props: { title: 'Ignored' },
      slots: { header: '<span class="custom-header">Custom</span>' },
    })
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.card-title').exists()).toBe(false)
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(Card, {
      slots: { footer: '<button class="footer-btn">OK</button>' },
    })
    expect(wrapper.find('.card-footer').exists()).toBe(true)
    expect(wrapper.find('.footer-btn').exists()).toBe(true)
  })

  it('applies card-sm class when small=true', () => {
    const wrapper = mount(Card, { props: { small: true } })
    expect(wrapper.find('.card').classes()).toContain('card-sm')
  })
})
