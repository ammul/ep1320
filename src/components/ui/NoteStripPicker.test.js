import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteStripPicker from './NoteStripPicker.vue'

describe('NoteStripPicker', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(NoteStripPicker)
    expect(wrapper.findAll('button.note-pill')).toHaveLength(12)
  })

  it('applies selected class to the modelValue note', () => {
    const wrapper = mount(NoteStripPicker, { props: { modelValue: 3 } })
    const buttons = wrapper.findAll('button.note-pill')
    expect(buttons[3].classes()).toContain('selected')
    expect(buttons[0].classes()).not.toContain('selected')
  })

  it('applies sharp class to sharp notes (A#, C#, D#, F#, G#)', () => {
    const wrapper = mount(NoteStripPicker)
    const buttons = wrapper.findAll('button.note-pill')
    // A-based: A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
    const sharpIndices = [1, 4, 6, 9, 11]
    buttons.forEach((btn, i) => {
      if (sharpIndices.includes(i)) {
        expect(btn.classes()).toContain('sharp')
      } else {
        expect(btn.classes()).not.toContain('sharp')
      }
    })
  })

  it('emits update:modelValue and note-down on pointerdown', async () => {
    const wrapper = mount(NoteStripPicker)
    const buttons = wrapper.findAll('button.note-pill')
    await buttons[5].trigger('pointerdown')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])
    expect(wrapper.emitted('note-down')).toBeTruthy()
    expect(wrapper.emitted('note-down')[0]).toEqual([5])
  })

  it('applies highlight class to notes in highlightSet', () => {
    const highlightSet = new Set([0, 3, 7])
    const wrapper = mount(NoteStripPicker, { props: { highlightSet } })
    const buttons = wrapper.findAll('button.note-pill')
    expect(buttons[0].classes()).toContain('highlight')
    expect(buttons[3].classes()).toContain('highlight')
    expect(buttons[7].classes()).toContain('highlight')
    expect(buttons[1].classes()).not.toContain('highlight')
  })

  it('does nothing when disabled', async () => {
    const wrapper = mount(NoteStripPicker, { props: { disabled: true } })
    const buttons = wrapper.findAll('button.note-pill')
    await buttons[2].trigger('pointerdown')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('note-down')).toBeFalsy()
  })
})
