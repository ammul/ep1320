import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OctaveControl from './OctaveControl.vue'

describe('OctaveControl', () => {
  it('displays the current octave value', () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 4, min: 1, max: 7 } })
    expect(wrapper.find('.octave-value').text()).toBe('4')
  })

  it('emits update:modelValue incremented on + click', async () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 4, min: 1, max: 7 } })
    const [, plusBtn] = wrapper.findAll('button')
    await plusBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])
  })

  it('emits update:modelValue decremented on - click', async () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 4, min: 1, max: 7 } })
    const [minusBtn] = wrapper.findAll('button')
    await minusBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([3])
  })

  it('disables decrement button at minimum value', () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 1, min: 1, max: 7 } })
    const [minusBtn] = wrapper.findAll('button')
    expect(minusBtn.attributes('disabled')).toBeDefined()
  })

  it('disables increment button at maximum value', () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 7, min: 1, max: 7 } })
    const [, plusBtn] = wrapper.findAll('button')
    expect(plusBtn.attributes('disabled')).toBeDefined()
  })

  it('does not emit when decrement would go below min', async () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 1, min: 1, max: 7 } })
    const [minusBtn] = wrapper.findAll('button')
    await minusBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not emit when increment would exceed max', async () => {
    const wrapper = mount(OctaveControl, { props: { modelValue: 7, min: 1, max: 7 } })
    const [, plusBtn] = wrapper.findAll('button')
    await plusBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
