import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote: vi.fn(),
  playNote: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', () => {
  const { ref } = require('vue')
  return {
    activeInputNotes: ref(new Set()),
    midiStatus: ref('idle'),
    chordOn: vi.fn(),
    chordOff: vi.fn(),
  }
})

import JamMode from './JamMode.vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { octave } from '@/state/octave.js'

beforeEach(() => {
  displayMode.value = 'pad'
  padSize.value = '4x3'
  octave.value = 4
})

describe('JamMode', () => {
  it('renders without errors', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders PageHeader with title "Jam Mode"', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.findComponent({ name: 'PageHeader' }).props('title')).toBe('Jam Mode')
  })

  it('renders a RootNotePicker', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.findComponent({ name: 'RootNotePicker' }).exists()).toBe(true)
  })

  it('renders a ScaleSelector', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.findComponent({ name: 'ScaleSelector' }).exists()).toBe(true)
  })

  describe('pad mode (default: A minor pentatonic)', () => {
    // A minor pentatonic intervals: [0,3,5,7,10]
    // ANCHOR_OFFSETS: {0,3,4,7} → from scale: {0,3,7}
    // In 4x3: 12 pads, noteIndex = padIdx % 12
    // root=0(A): class 'root'; anchor=3(C),7(E): class 'anchor'; active=5(D),10(G): class 'active'

    it('marks 4 rows of 3 pads in 4x3 mode', () => {
      const wrapper = mount(JamMode)
      expect(wrapper.findAll('.row')).toHaveLength(4)
    })

    it('marks root pad with root class', () => {
      const wrapper = mount(JamMode)
      const rootPads = wrapper.findAll('.pad.root')
      // noteIndex 0 (A) appears once in 12 pads
      expect(rootPads.length).toBeGreaterThanOrEqual(1)
    })

    it('marks inactive pads for notes not in scale', () => {
      const wrapper = mount(JamMode)
      const inactivePads = wrapper.findAll('.pad.inactive')
      // 12 - 5 scale notes = 7 inactive
      expect(inactivePads).toHaveLength(7)
    })

    it('marks anchor pads for strong scale tones', () => {
      const wrapper = mount(JamMode)
      const anchorPads = wrapper.findAll('.pad.anchor')
      // anchor: indices 3(C) and 7(E) — not root
      expect(anchorPads).toHaveLength(2)
    })

    it('marks active pads for non-anchor scale tones', () => {
      const wrapper = mount(JamMode)
      const activePads = wrapper.findAll('.pad.active')
      // active: indices 5(D) and 10(G)
      expect(activePads).toHaveLength(2)
    })
  })

  describe('subtitle', () => {
    it('includes "lit pads" for pad mode', () => {
      const wrapper = mount(JamMode)
      const header = wrapper.findComponent({ name: 'PageHeader' })
      expect(header.props('subtitle')).toContain('lit pads')
    })

    it('includes "highlighted notes" for notes mode', async () => {
      displayMode.value = 'notes'
      const wrapper = mount(JamMode)
      await nextTick()
      const header = wrapper.findComponent({ name: 'PageHeader' })
      expect(header.props('subtitle')).toContain('highlighted notes')
    })
  })
})
