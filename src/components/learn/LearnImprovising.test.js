import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote:  vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnImprovising from './LearnImprovising.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnImprovising', () => {
  it('renders 3 improv chord type items', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.findAll('.improv-item')).toHaveLength(3)
  })

  it('renders chord picker buttons', () => {
    const wrapper = mount(LearnImprovising)
    const btns = wrapper.findAll('.ie-chord-btn')
    expect(btns).toHaveLength(3)
  })

  it('first chord is selected by default', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.findAll('.ie-chord-btn')[0].classes()).toContain('active')
  })

  it('clicking a chord btn changes active selection', async () => {
    const wrapper = mount(LearnImprovising)
    await wrapper.findAll('.ie-chord-btn')[1].trigger('click')
    expect(wrapper.findAll('.ie-chord-btn')[1].classes()).toContain('active')
    expect(wrapper.findAll('.ie-chord-btn')[0].classes()).not.toContain('active')
  })

  it('renders good and bad note buttons', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.findAll('.ie-note-btn.good').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.ie-note-btn.bad').length).toBeGreaterThan(0)
  })

  it('renders 3 tips', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.findAll('.tip')).toHaveLength(3)
  })
})
