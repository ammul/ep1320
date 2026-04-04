import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ScaleSelector from './ScaleSelector.vue'

const scales = [
  { id: 'mi.p', label: 'mi.p - Minor Pentatonic', description: 'Great for improv.' },
  { id: 'maj',  label: 'maj - Major',              description: 'Bright and resolved.' },
  { id: 'dor',  label: 'dor - Dorian',             description: 'Soulful and funky.' },
]

describe('ScaleSelector', () => {
  it('renders a select with one option per scale', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: false },
    })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(scales.length)
    expect(options[0].text()).toBe('mi.p - Minor Pentatonic')
  })

  it('select value reflects modelValue prop', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'maj', scales, showInfo: false },
    })
    const select = wrapper.find('select')
    expect(select.element.value).toBe('maj')
  })

  it('emits update:modelValue with new scale id on change', async () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: false },
    })
    const select = wrapper.find('select')
    await select.setValue('maj')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual(['maj'])
  })

  it('emits update:showInfo false when scale changes', async () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: true },
    })
    const select = wrapper.find('select')
    await select.setValue('dor')
    const emitted = wrapper.emitted('update:showInfo')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([false])
  })

  it('renders info button', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: false },
    })
    expect(wrapper.find('.info-btn').exists()).toBe(true)
  })

  it('info button has active class when showInfo is true', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: true },
    })
    expect(wrapper.find('.info-btn').classes()).toContain('active')
  })

  it('does not show description when showInfo is false', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: false },
    })
    expect(wrapper.find('.scale-info').exists()).toBe(false)
  })

  it('shows scale description when showInfo is true', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: true },
    })
    expect(wrapper.find('.scale-info').exists()).toBe(true)
    expect(wrapper.find('.scale-info').text()).toBe('Great for improv.')
  })

  it('toggles showInfo on info button click', async () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales, showInfo: false },
    })
    await wrapper.find('.info-btn').trigger('click')
    const emitted = wrapper.emitted('update:showInfo')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([true])
  })
})
