import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LearnStepFooter from './LearnStepFooter.vue'

describe('LearnStepFooter', () => {
  it('displays step counter correctly', () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 0, total: 7 } })
    expect(wrapper.find('.step-counter').text()).toBe('1 / 7')
  })

  it('displays correct counter for mid-step', () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 3, total: 7 } })
    expect(wrapper.find('.step-counter').text()).toBe('4 / 7')
  })

  it('Back button is disabled on first step', () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 0, total: 7 } })
    expect(wrapper.find('.nav-btn').attributes('disabled')).toBeDefined()
  })

  it('Next button is disabled on last step', () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 6, total: 7 } })
    const btns = wrapper.findAll('.nav-btn')
    expect(btns[1].attributes('disabled')).toBeDefined()
  })

  it('Back button is enabled when not on first step', () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 2, total: 7 } })
    expect(wrapper.find('.nav-btn').attributes('disabled')).toBeUndefined()
  })

  it('emits prev when Back is clicked', async () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 2, total: 7 } })
    await wrapper.find('.nav-btn').trigger('click')
    expect(wrapper.emitted('prev')).toBeTruthy()
  })

  it('emits next when Next is clicked', async () => {
    const wrapper = mount(LearnStepFooter, { props: { step: 2, total: 7 } })
    const btns = wrapper.findAll('.nav-btn')
    await btns[1].trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })
})
