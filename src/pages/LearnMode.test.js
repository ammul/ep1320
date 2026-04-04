import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

vi.mock('@/audio/drumEngine.js', async () => {
  const { ref } = await import('vue')
  return {
    isPlaying:   ref(false),
    pattern:     ref(Array.from({ length: 8 }, () => new Array(16).fill(false))),
    currentStep: ref(0),
    play:        vi.fn(),
    pause:       vi.fn(),
  }
})

import LearnMode from './LearnMode.vue'
import { isPlaying as drumIsPlaying, pause as drumPause } from '@/audio/drumEngine.js'

beforeEach(async () => {
  vi.clearAllMocks()
  drumIsPlaying.value = false
})

// ── Step navigation ─────────────────────────────────────────────────────────

describe('step navigation', () => {
  it('renders 7 step buttons', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')).toHaveLength(7)
  })

  it('step labels match the expected order', () => {
    const wrapper = mount(LearnMode)
    const labels = wrapper.findAll('.step-label').map(el => el.text())
    expect(labels).toEqual(['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats'])
  })

  it('first step is active by default', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('active')
  })

  it('clicking a step marks it active and prior steps as done', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[2].trigger('click')
    expect(wrapper.findAll('.step-btn')[2].classes()).toContain('active')
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('done')
  })

  it('Next button advances the step', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.find('.nav-btn:last-child').trigger('click')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('active')
  })

  it('Back button is disabled on the first step', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.nav-btn').attributes('disabled')).toBeDefined()
  })

  it('step counter reflects current position', async () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.step-counter').text()).toBe('1 / 7')
    await wrapper.findAll('.step-btn')[3].trigger('click')
    expect(wrapper.find('.step-counter').text()).toBe('4 / 7')
  })
})

// ── Orchestration: correct component at each step ────────────────────────────

describe('step components', () => {
  it('renders LearnRootNotes at step 0', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findComponent({ name: 'LearnRootNotes' }).exists()).toBe(true)
  })

  it('renders LearnIntervals at step 1', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[1].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnIntervals' }).exists()).toBe(true)
  })

  it('renders LearnScales at step 2', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[2].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnScales' }).exists()).toBe(true)
  })

  it('renders LearnProgressions at step 3', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[3].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnProgressions' }).exists()).toBe(true)
  })

  it('renders LearnChords at step 4', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[4].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnChords' }).exists()).toBe(true)
  })

  it('renders LearnImprovising at step 5', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[5].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnImprovising' }).exists()).toBe(true)
  })

  it('renders LearnBeats at step 6', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[6].trigger('click')
    expect(wrapper.findComponent({ name: 'LearnBeats' }).exists()).toBe(true)
  })
})

// ── Drum pause on step change ─────────────────────────────────────────────────

describe('beats integration', () => {
  it('navigating away from beats step pauses drums if playing', async () => {
    drumIsPlaying.value = true
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[6].trigger('click')
    await wrapper.findAll('.step-btn')[0].trigger('click')
    expect(drumPause).toHaveBeenCalled()
  })
})
