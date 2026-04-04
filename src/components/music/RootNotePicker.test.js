import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RootNotePicker from './RootNotePicker.vue'

describe('RootNotePicker', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'A' } })
    expect(wrapper.findAll('button')).toHaveLength(12)
  })

  it('marks the active note with active class', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'C' } })
    const activeButtons = wrapper.findAll('button.active')
    expect(activeButtons).toHaveLength(1)
    expect(activeButtons[0].text()).toBe('C')
  })

  it('has no active button when modelValue is undefined', () => {
    const wrapper = mount(RootNotePicker)
    expect(wrapper.findAll('button.active')).toHaveLength(0)
  })

  it('marks sharp notes with sharp class', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'A' } })
    const sharpButtons = wrapper.findAll('button.sharp')
    const sharpNotes = sharpButtons.map(b => b.text())
    expect(sharpNotes).toEqual(expect.arrayContaining(['A#', 'C#', 'D#', 'F#', 'G#']))
    expect(sharpNotes).toHaveLength(5)
  })

  it('emits update:modelValue with note name when button is clicked', async () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'A' } })
    const buttons = wrapper.findAll('button')
    // Find C button (index 3 in A-based NOTES: A,A#,B,C...)
    const cButton = buttons.find(b => b.text() === 'C')
    await cButton.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['C'])
  })

  it('does not give sharp class to natural notes', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'A' } })
    const buttons = wrapper.findAll('button')
    const naturalNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    naturalNotes.forEach(note => {
      const btn = buttons.find(b => b.text() === note)
      expect(btn.classes()).not.toContain('sharp')
    })
  })
})
