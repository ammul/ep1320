import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote:  vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnChords from './LearnChords.vue'
import { playChord } from '@/audio/audioEngine.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnChords', () => {
  it('renders 3 chord type cards', () => {
    const wrapper = mount(LearnChords)
    expect(wrapper.findAll('.chord-type-card')).toHaveLength(3)
  })

  it('each card has a Hear it button', () => {
    const wrapper = mount(LearnChords)
    const btns = wrapper.findAll('.ctc-play')
    expect(btns).toHaveLength(3)
    for (const btn of btns) {
      expect(btn.text()).toBe('Hear it')
    }
  })

  it('displays interval pills for each chord', () => {
    const wrapper = mount(LearnChords)
    const pills = wrapper.findAll('.ctc-interval-pill')
    // major (3) + minor (3) + dom7 (4) = 10 pills
    expect(pills.length).toBe(10)
  })

  it('renders root note picker', () => {
    const wrapper = mount(LearnChords)
    expect(wrapper.find('.picker-row').exists()).toBe(true)
  })
})
