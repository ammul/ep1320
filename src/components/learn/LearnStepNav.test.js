import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LearnStepNav from './LearnStepNav.vue'

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats']

describe('LearnStepNav', () => {
  it('renders the correct number of step buttons', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    expect(wrapper.findAll('.step-btn')).toHaveLength(7)
  })

  it('renders step labels in correct order', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    const labels = wrapper.findAll('.step-label').map(el => el.text())
    expect(labels).toEqual(STEPS)
  })

  it('marks the active step with the active class', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 2 } })
    expect(wrapper.findAll('.step-btn')[2].classes()).toContain('active')
    expect(wrapper.findAll('.step-btn')[0].classes()).not.toContain('active')
  })

  it('marks steps before modelValue with the done class', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 3 } })
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[2].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[3].classes()).not.toContain('done')
  })

  it('emits update:modelValue with the clicked step index', async () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    await wrapper.findAll('.step-btn')[4].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([4])
  })
})
