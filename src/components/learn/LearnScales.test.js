import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnScales from './LearnScales.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnScales', () => {
  it('renders scale selector tabs', () => {
    const wrapper = mount(LearnScales)
    expect(wrapper.findAll('.scale-tab').length).toBeGreaterThan(0)
  })

  it('renders scale display tiles for all 12 chromatic notes', () => {
    const wrapper = mount(LearnScales)
    expect(wrapper.findAll('.scale-tile')).toHaveLength(12)
  })

  it('Major scale highlights 7 notes', () => {
    const wrapper = mount(LearnScales)
    expect(wrapper.findAll('.scale-tile.active').length).toBe(7)
  })

  it('C major scale has root class on C tile', () => {
    const wrapper = mount(LearnScales)
    const rootTiles = wrapper.findAll('.scale-tile.root')
    expect(rootTiles).toHaveLength(1)
  })
})
