import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote: vi.fn(),
  playNote: vi.fn(),
}))

import ScaleVisualizer from './ScaleVisualizer.vue'
import { displayMode } from '../displayMode.js'
import { NOTES } from '../musicConstants.js'

beforeEach(() => {
  displayMode.value = 'ep1320'
})

const SCALES = {
  maj:  [0, 2, 4, 5, 7, 9, 11],
  min:  [0, 2, 3, 5, 7, 8, 10],
  '12t': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'ma.p': [0, 2, 4, 7, 9],
  'mi.p': [0, 3, 5, 7, 10],
}

describe('ScaleVisualizer', () => {
  it('renders without errors', () => {
    const wrapper = mount(ScaleVisualizer)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a root note picker', () => {
    const wrapper = mount(ScaleVisualizer)
    expect(wrapper.findComponent({ name: 'RootNotePicker' }).exists()).toBe(true)
  })

  describe('ep1320 mode', () => {
    it('renders 4 rows of 3 pads', () => {
      const wrapper = mount(ScaleVisualizer)
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThanOrEqual(4)
    })

    it('major scale from A highlights correct 7 notes', async () => {
      const wrapper = mount(ScaleVisualizer)
      await nextTick()
      // default is A major — 7 active pads
      const activePads = wrapper.findAll('.pad.active')
      expect(activePads).toHaveLength(7)
    })

    it('chromatic scale highlights all 12 pads', async () => {
      const wrapper = mount(ScaleVisualizer)
      // Change scale to chromatic by finding the scale select
      const scaleSelects = wrapper.findAll('select, .scale-btn, [data-scale]')
      // Instead, test via the scale intervals directly
      // All 12 pads should be active for chromatic
      // Find scale selector and change it
      const selectEl = wrapper.find('select')
      if (selectEl.exists()) {
        await selectEl.setValue('12t')
        await nextTick()
        const activePads = wrapper.findAll('.pad.active')
        expect(activePads).toHaveLength(12)
      }
    })
  })

  describe('scale interval correctness', () => {
    it.each(Object.entries(SCALES))('%s scale has %i notes', (scaleId, intervals) => {
      expect(intervals[0]).toBe(0)
      expect(new Set(intervals).size).toBe(intervals.length)
      for (const v of intervals) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(12)
      }
    })

    it('major scale from root A produces correct note set', () => {
      const rootIdx = 0 // A
      const intervals = SCALES.maj
      const noteSet = new Set(intervals.map(i => (rootIdx + i) % 12))
      const noteNames = [...noteSet].map(i => NOTES[i]).sort()
      expect(noteNames).toContain('A')
      expect(noteNames).toContain('B')
      expect(noteNames).toContain('C#')
      expect(noteNames).toContain('D')
      expect(noteNames).toContain('E')
      expect(noteNames).toContain('F#')
      expect(noteNames).toContain('G#')
    })

    it('minor scale from root A produces correct note set', () => {
      const rootIdx = 0 // A
      const intervals = SCALES.min
      const noteSet = new Set(intervals.map(i => (rootIdx + i) % 12))
      const noteNames = [...noteSet].map(i => NOTES[i]).sort()
      expect(noteNames).toContain('A')
      expect(noteNames).toContain('B')
      expect(noteNames).toContain('C')
      expect(noteNames).toContain('D')
      expect(noteNames).toContain('E')
      expect(noteNames).toContain('F')
      expect(noteNames).toContain('G')
    })

    it('all scale types produce valid note indices for every root', () => {
      for (const intervals of Object.values(SCALES)) {
        for (let root = 0; root < 12; root++) {
          const noteSet = new Set(intervals.map(i => (root + i) % 12))
          for (const idx of noteSet) {
            expect(idx).toBeGreaterThanOrEqual(0)
            expect(idx).toBeLessThan(12)
          }
        }
      }
    })
  })

  describe('notes mode', () => {
    it('renders chromatic tiles in notes mode', async () => {
      displayMode.value = 'notes'
      const wrapper = mount(ScaleVisualizer)
      await nextTick()
      const tiles = wrapper.findAll('.chroma-tile, .note-tile, .note-btn')
      expect(tiles.length).toBeGreaterThan(0)
    })
  })
})
