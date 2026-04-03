import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Mock AudioContext before importing drumEngine
vi.stubGlobal('AudioContext', vi.fn(() => ({
  state: 'running',
  currentTime: 0,
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({
    type: '',
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
    connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(1)) })),
  createBufferSource: vi.fn(() => ({
    buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  })),
  createBiquadFilter: vi.fn(() => ({
    type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn(),
  })),
  destination: {},
  sampleRate: 44100,
})))

import DrumComputer from './DrumComputer.vue'
import { pattern, bpm, isPlaying, toggleCell, INSTRUMENTS } from '@/audio/drumEngine.js'

beforeEach(() => {
  // Reset state
  bpm.value = 120
  isPlaying.value = false
  pattern.value = Array.from({ length: 9 }, () => new Array(16).fill(false))
})

describe('DrumComputer', () => {
  it('renders 9 instrument rows', () => {
    const wrapper = mount(DrumComputer)
    const rows = wrapper.findAll('.inst-row')
    expect(rows).toHaveLength(9)
  })

  it('renders 16 step buttons per instrument row', () => {
    const wrapper = mount(DrumComputer)
    const rows = wrapper.findAll('.inst-row')
    for (const row of rows) {
      expect(row.findAll('.step-btn')).toHaveLength(16)
    }
  })

  it('renders instrument names', () => {
    const wrapper = mount(DrumComputer)
    const names = wrapper.findAll('.inst-name').map(el => el.text())
    for (const inst of INSTRUMENTS) {
      expect(names).toContain(inst)
    }
  })

  it('all step buttons start as off', () => {
    const wrapper = mount(DrumComputer)
    const onButtons = wrapper.findAll('.step-btn.on')
    expect(onButtons).toHaveLength(0)
  })

  it('toggleCell turns a step on', async () => {
    toggleCell(0, 0)
    expect(pattern.value[0][0]).toBe(true)
  })

  it('toggleCell toggles a step off when already on', async () => {
    toggleCell(0, 0)
    toggleCell(0, 0)
    expect(pattern.value[0][0]).toBe(false)
  })

  it('toggleCell only affects the specified cell', async () => {
    toggleCell(2, 5)
    expect(pattern.value[2][5]).toBe(true)
    expect(pattern.value[0][0]).toBe(false)
    expect(pattern.value[2][6]).toBe(false)
  })

  it('toggled step renders with on class', async () => {
    toggleCell(0, 0)
    const wrapper = mount(DrumComputer)
    await nextTick()
    const firstRow = wrapper.findAll('.inst-row')[0]
    const firstBtn = firstRow.findAll('.step-btn')[0]
    expect(firstBtn.classes()).toContain('on')
  })

  it('BPM defaults to 120', () => {
    const wrapper = mount(DrumComputer)
    const input = wrapper.find('.bpm-input')
    expect(Number(input.element.value)).toBe(120)
  })

  it('BPM can be changed via the ref', async () => {
    bpm.value = 140
    const wrapper = mount(DrumComputer)
    await nextTick()
    const input = wrapper.find('.bpm-input')
    expect(Number(input.element.value)).toBe(140)
  })

  it('shows Play button when not playing', () => {
    const wrapper = mount(DrumComputer)
    expect(wrapper.find('.transport-btn').text()).toBe('Play')
  })

  it('shows Pause button when playing', async () => {
    isPlaying.value = true
    const wrapper = mount(DrumComputer)
    await nextTick()
    expect(wrapper.find('.transport-btn').text()).toBe('Pause')
  })
})
