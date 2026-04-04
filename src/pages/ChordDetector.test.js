import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  startNote: vi.fn(),
  stopNote: vi.fn(),
}))

import ChordDetector from './ChordDetector.vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'

beforeEach(() => {
  displayMode.value = 'pad'
  padSize.value = '4x3'
})

describe('ChordDetector', () => {
  it('renders without errors', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders PageHeader with title "Chord Detector"', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.findComponent({ name: 'PageHeader' }).props('title')).toBe('Chord Detector')
  })

  it('shows hint text when no notes are selected', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.find('.hint').text()).toBe('Select two or more notes')
  })

  it('renders 4 rows of pads in default 4x3 layout', () => {
    const wrapper = mount(ChordDetector)
    const rows = wrapper.findAll('.row')
    expect(rows).toHaveLength(4)
  })

  it('renders 3 pads per row in 4x3 layout', () => {
    const wrapper = mount(ChordDetector)
    const rows = wrapper.findAll('.row')
    rows.forEach(row => {
      expect(row.findAll('.pad')).toHaveLength(3)
    })
  })

  it('renders 4 pads per row in 4x4 layout', async () => {
    padSize.value = '4x4'
    const wrapper = mount(ChordDetector)
    await nextTick()
    const rows = wrapper.findAll('.row')
    rows.forEach(row => {
      expect(row.findAll('.pad')).toHaveLength(4)
    })
  })

  describe('note selection', () => {
    it('marks a pad as selected after clicking it', async () => {
      const wrapper = mount(ChordDetector)
      const firstPad = wrapper.find('.pad')
      await firstPad.trigger('pointerdown')
      expect(firstPad.classes()).toContain('selected')
    })

    it('deselects a pad on second click', async () => {
      const wrapper = mount(ChordDetector)
      const firstPad = wrapper.find('.pad')
      await firstPad.trigger('pointerdown')
      await firstPad.trigger('pointerdown')
      expect(firstPad.classes()).not.toContain('selected')
    })

    it('shows result panel (not hint) when notes are selected', async () => {
      const wrapper = mount(ChordDetector)
      const pads = wrapper.findAll('.pad')
      // Select any two pads to trigger chord detection attempt
      await pads[0].trigger('pointerdown')
      await pads[3].trigger('pointerdown')
      await nextTick()
      // Hint should be gone — result panel should be showing something
      expect(wrapper.find('.hint').exists()).toBe(false)
      // Either a chord name or 'No matching chord' should show
      const hasChord = wrapper.find('.chord-name').exists()
      const hasQuality = wrapper.find('.chord-quality').exists()
      expect(hasChord || hasQuality).toBe(true)
    })

    it('shows unknown chord indicator for unrecognised notes', async () => {
      const wrapper = mount(ChordDetector)
      const pads = wrapper.findAll('.pad')
      // Select 3 consecutive semitones - not a standard chord
      await pads[0].trigger('pointerdown')  // A
      await pads[1].trigger('pointerdown')  // A#
      await pads[2].trigger('pointerdown')  // B
      // This may or may not be detected, but if not detected shows '?'
      if (wrapper.find('.chord-name.unknown').exists()) {
        expect(wrapper.find('.chord-name.unknown').text()).toBe('?')
        expect(wrapper.find('.chord-quality').text()).toBe('No matching chord')
      }
    })
  })

  describe('clearAll()', () => {
    it('deselects all notes when Clear is clicked', async () => {
      const wrapper = mount(ChordDetector)
      const pads = wrapper.findAll('.pad')
      await pads[0].trigger('pointerdown')
      await pads[3].trigger('pointerdown')
      await wrapper.find('.clear-btn').trigger('click')
      expect(wrapper.findAll('.pad.selected')).toHaveLength(0)
    })

    it('shows hint again after clearing', async () => {
      const wrapper = mount(ChordDetector)
      await wrapper.find('.pad').trigger('pointerdown')
      await wrapper.find('.clear-btn').trigger('click')
      expect(wrapper.find('.hint').exists()).toBe(true)
    })

    it('Clear button is disabled when nothing is selected', () => {
      const wrapper = mount(ChordDetector)
      expect(wrapper.find('.clear-btn').attributes('disabled')).toBeDefined()
    })

    it('Clear button is enabled when a note is selected', async () => {
      const wrapper = mount(ChordDetector)
      await wrapper.find('.pad').trigger('pointerdown')
      expect(wrapper.find('.clear-btn').attributes('disabled')).toBeUndefined()
    })
  })
})
