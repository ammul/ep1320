import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

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

import LearnBeats from './LearnBeats.vue'
import { isPlaying as drumIsPlaying, pattern as drumPattern, play as drumPlay, pause as drumPause } from '@/audio/drumEngine.js'

beforeEach(async () => {
  vi.clearAllMocks()
  drumIsPlaying.value = false
  drumPattern.value = Array.from({ length: 8 }, () => new Array(16).fill(false))
})

describe('LearnBeats', () => {
  it('renders 3 beat pattern cards', () => {
    const wrapper = mount(LearnBeats)
    expect(wrapper.findAll('.beat-pattern')).toHaveLength(3)
  })

  it('each beat pattern has Play and Edit buttons', () => {
    const wrapper = mount(LearnBeats)
    const cards = wrapper.findAll('.beat-pattern')
    for (const card of cards) {
      expect(card.find('.bp-play-btn').exists()).toBe(true)
      expect(card.find('.bp-edit-btn').exists()).toBe(true)
    }
  })

  it('loadBeat sets the drum pattern correctly for basic rock beat', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPattern.value[0][0]).toBe(true)   // kick beat 1
    expect(drumPattern.value[0][8]).toBe(true)   // kick beat 3
    expect(drumPattern.value[0][4]).toBe(false)  // no kick on beat 2
    expect(drumPattern.value[1][4]).toBe(true)   // snare beat 2
    expect(drumPattern.value[1][12]).toBe(true)  // snare beat 4
    expect(drumPattern.value[3][0]).toBe(true)   // hi-hat on
    expect(drumPattern.value[3][1]).toBe(false)  // hi-hat off
    expect(drumPattern.value[3][2]).toBe(true)   // hi-hat on
  })

  it('rows 4–8 are all silent in built drum pattern', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    for (let r = 4; r < 9; r++) {
      expect(drumPattern.value[r].every(s => s === false)).toBe(true)
    }
  })

  it('loadBeat starts drum playback', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalled()
  })

  it('loading the same pattern twice unloads it without calling play again', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalledTimes(1)
  })

  it('editBeat emits navigate event with drums', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-edit-btn')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0]).toEqual(['drums'])
  })

  it('four-on-the-floor pattern has kick on all 4 beats', async () => {
    const wrapper = mount(LearnBeats)
    await wrapper.findAll('.bp-play-btn')[1].trigger('click')
    expect(drumPattern.value[0][0]).toBe(true)
    expect(drumPattern.value[0][4]).toBe(true)
    expect(drumPattern.value[0][8]).toBe(true)
    expect(drumPattern.value[0][12]).toBe(true)
  })
})
