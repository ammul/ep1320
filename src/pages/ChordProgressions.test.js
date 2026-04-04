import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote:    vi.fn(),
  stopNote:     vi.fn(),
  playNote:     vi.fn(),
  stopAllNotes: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', () => {
  const { ref } = require('vue')
  return {
    midiStatus:    ref('idle'),
    midiChannel:   ref(0),
    chordOn:       vi.fn(),
    chordOff:      vi.fn(),
  }
})

import ChordProgressions from './ChordProgressions.vue'
import { ALL_PROGRESSIONS, GENRES } from '@/constants/progressions.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ChordProgressions', () => {
  it('renders without errors', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders PageHeader with title "Chord Progressions"', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.findComponent({ name: 'PageHeader' }).props('title')).toBe('Chord Progressions')
  })

  it('renders GenreTabs component', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.findComponent({ name: 'GenreTabs' }).exists()).toBe(true)
  })

  it('renders two ProgressionSection components (major and minor)', () => {
    const wrapper = mount(ChordProgressions)
    const sections = wrapper.findAllComponents({ name: 'ProgressionSection' })
    expect(sections).toHaveLength(2)
  })

  it('renders a RootNotePicker', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.findComponent({ name: 'RootNotePicker' }).exists()).toBe(true)
  })

  describe('filteredProgressions', () => {
    it('shows all progressions when genre is "all" (default)', () => {
      const wrapper = mount(ChordProgressions)
      const sections = wrapper.findAllComponents({ name: 'ProgressionSection' })
      const totalRendered = sections.reduce(
        (sum, s) => sum + (s.props('progressions')?.length ?? 0), 0
      )
      expect(totalRendered).toBe(ALL_PROGRESSIONS.length)
    })

    it('filters progressions by genre when a specific genre is selected', async () => {
      const wrapper = mount(ChordProgressions)
      // Find a genre that has fewer than all progressions
      const firstRealGenre = GENRES.find(g => g !== 'all')
      if (!firstRealGenre) return // skip if no genres

      const genreTabs = wrapper.findComponent({ name: 'GenreTabs' })
      await genreTabs.vm.$emit('update:modelValue', firstRealGenre)
      await nextTick()

      const sections = wrapper.findAllComponents({ name: 'ProgressionSection' })
      const totalRendered = sections.reduce(
        (sum, s) => sum + (s.props('progressions')?.length ?? 0), 0
      )
      const expected = ALL_PROGRESSIONS.filter(p => p.genre === firstRealGenre).length
      expect(totalRendered).toBe(expected)
    })
  })

  describe('handleToggleExpand', () => {
    it('passes expandedId to ProgressionSection', () => {
      const wrapper = mount(ChordProgressions)
      const section = wrapper.findComponent({ name: 'ProgressionSection' })
      expect(section.props('expandedId')).toBeDefined()
    })

    it('expands a different progression and collapses the current one', async () => {
      const wrapper = mount(ChordProgressions)
      const sections = wrapper.findAllComponents({ name: 'ProgressionSection' })

      // Default expandedId is 'pop-1' — find a different progression id
      const allProgs = sections.reduce((acc, s) => [...acc, ...(s.props('progressions') ?? [])], [])
      const otherId = allProgs.find(p => p.id !== 'pop-1')?.id
      if (!otherId) return

      // Emit toggle-expand with a different id — should expand that one
      await sections[0].vm.$emit('toggle-expand', otherId)
      await nextTick()
      expect(sections[0].props('expandedId')).toBe(otherId)

      // Emit toggle-expand with the same id again — should collapse
      await sections[0].vm.$emit('toggle-expand', otherId)
      await nextTick()
      expect(sections[0].props('expandedId')).toBeNull()
    })
  })

  describe('loop playback', () => {
    it('starts loop when play is emitted from a ProgressionSection', async () => {
      const wrapper = mount(ChordProgressions)
      const section = wrapper.findAllComponents({ name: 'ProgressionSection' })[0]
      const progs = section.props('progressions')
      if (!progs?.length) return

      await section.vm.$emit('play', progs[0].id)
      await nextTick()

      expect(section.props('playingId')).toBe(progs[0].id)
    })

    it('stops loop when stop is emitted', async () => {
      const wrapper = mount(ChordProgressions)
      const section = wrapper.findAllComponents({ name: 'ProgressionSection' })[0]
      const progs = section.props('progressions')
      if (!progs?.length) return

      await section.vm.$emit('play', progs[0].id)
      await nextTick()
      await section.vm.$emit('stop')
      await nextTick()

      expect(section.props('playingId')).toBeNull()
    })
  })
})
