import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnIntervals from './LearnIntervals.vue'
import { playChord } from '@/audio/audioEngine.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnIntervals', () => {
  it('renders 12 note buttons in the strip', () => {
    const wrapper = mount(LearnIntervals)
    expect(wrapper.findAll('.note-strip .note-pill')).toHaveLength(12)
  })

  it('shows the interval reference grid with 11 entries', () => {
    const wrapper = mount(LearnIntervals)
    expect(wrapper.findAll('.ref-item')).toHaveLength(11)
  })

  it('clicking a ref interval highlights it and shows interval info', async () => {
    const wrapper = mount(LearnIntervals)
    await wrapper.findAll('.ref-item')[6].trigger('click')
    expect(wrapper.findAll('.ref-item')[6].classes()).toContain('highlight')
    expect(wrapper.find('.iv-name').text()).toBe('Perfect 5th')
  })

  it('clicking a ref interval calls playChord with correct notes', async () => {
    const wrapper = mount(LearnIntervals)
    await wrapper.findAll('.ref-item')[0].trigger('click')
    expect(playChord).toHaveBeenCalledWith([60, 61])
  })

  it('clicking the same ref interval again deselects it', async () => {
    const wrapper = mount(LearnIntervals)
    await wrapper.findAll('.ref-item')[0].trigger('click')
    await wrapper.findAll('.ref-item')[0].trigger('click')
    expect(wrapper.findAll('.ref-item')[0].classes()).not.toContain('highlight')
    expect(wrapper.find('.iv-name').exists()).toBe(false)
  })

  it('picks first note on first tap and sets from class', async () => {
    const wrapper = mount(LearnIntervals)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    expect(pills[0].classes()).toContain('from')
  })

  it('shows intervalInfo after picking two different notes', async () => {
    const wrapper = mount(LearnIntervals)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    await pills[4].trigger('pointerdown') // E = Major 3rd (4 semitones)
    expect(wrapper.find('.iv-name').text()).toBe('Major 3rd')
    expect(wrapper.find('.iv-path').text()).toBe('C → E')
  })

  it('shows intervalInfo for minor 3rd', async () => {
    const wrapper = mount(LearnIntervals)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    await pills[3].trigger('pointerdown') // D# = Minor 3rd (3 semitones)
    expect(wrapper.find('.iv-name').text()).toBe('Minor 3rd')
  })

  it('tapping same note again resets from and starts over', async () => {
    const wrapper = mount(LearnIntervals)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C -> from
    await pills[4].trigger('pointerdown') // E -> to (interval shown)
    await pills[7].trigger('pointerdown') // G -> resets, now from=G
    expect(pills[7].classes()).toContain('from')
    expect(wrapper.find('.iv-name').exists()).toBe(false)
    expect(wrapper.find('.iv-hint').text()).toBe('Now pick a second note')
  })
})
