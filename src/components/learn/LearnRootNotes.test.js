import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnRootNotes from './LearnRootNotes.vue'
import { playNote } from '@/audio/audioEngine.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnRootNotes', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(LearnRootNotes)
    expect(wrapper.findAll('.note-pill')).toHaveLength(12)
  })

  it('shows hint text when no note is selected', () => {
    const wrapper = mount(LearnRootNotes)
    expect(wrapper.find('.rr-hint').exists()).toBe(true)
  })

  it('shows root name after picking a note', async () => {
    const wrapper = mount(LearnRootNotes)
    await wrapper.findAll('.note-pill')[0].trigger('pointerdown')
    expect(wrapper.find('.rr-name').text()).toBe('C')
    expect(wrapper.find('.rr-hint').exists()).toBe(false)
  })

  it('calls playNote with the correct MIDI note', async () => {
    const wrapper = mount(LearnRootNotes)
    await wrapper.findAll('.note-pill')[2].trigger('pointerdown') // B (index 2, A-based)
    expect(playNote).toHaveBeenCalledWith(71) // 60 + NOTE_TO_SEMI[2] = 60 + 11
  })

  it('selected note gets the from class', async () => {
    const wrapper = mount(LearnRootNotes)
    await wrapper.findAll('.note-pill')[5].trigger('pointerdown') // F
    expect(wrapper.findAll('.note-pill')[5].classes()).toContain('from')
    expect(wrapper.findAll('.note-pill')[0].classes()).not.toContain('from')
  })

  it('sharp notes have the sharp class', () => {
    const wrapper = mount(LearnRootNotes)
    const pills = wrapper.findAll('.note-pill')
    // NOTES is A-based: A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
    expect(pills[1].classes()).toContain('sharp')  // A#
    expect(pills[4].classes()).toContain('sharp')  // C#
    expect(pills[0].classes()).not.toContain('sharp') // A
    expect(pills[2].classes()).not.toContain('sharp') // B
  })

  it('shows the octave button after picking a note', async () => {
    const wrapper = mount(LearnRootNotes)
    await wrapper.findAll('.note-pill')[0].trigger('pointerdown')
    expect(wrapper.find('.rr-octave-btn').exists()).toBe(true)
  })
})
