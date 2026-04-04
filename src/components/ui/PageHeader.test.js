import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from './PageHeader.vue'

describe('PageHeader', () => {
  it('renders title', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Test Title' } })
    expect(wrapper.find('.page-header-title').text()).toBe('Test Title')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Test', subtitle: 'A subtitle' } })
    expect(wrapper.find('.page-header-subtitle').exists()).toBe(true)
    expect(wrapper.find('.page-header-subtitle').text()).toBe('A subtitle')
  })

  it('does not render subtitle element when not provided', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Test' } })
    expect(wrapper.find('.page-header-subtitle').exists()).toBe(false)
  })

  it('renders actions slot content when provided', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Test' },
      slots: { actions: '<button class="test-action">Close</button>' },
    })
    expect(wrapper.find('.page-header-actions').exists()).toBe(true)
    expect(wrapper.find('.test-action').exists()).toBe(true)
  })

  it('does not render actions div when no slot provided', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Test' } })
    expect(wrapper.find('.page-header-actions').exists()).toBe(false)
  })
})
