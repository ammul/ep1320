import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

function MockAudioContext() {
  this.state = 'running'
  this.currentTime = 0
  this.sampleRate = 44100
  this.destination = {}
  this.resume = vi.fn()
  this.createOscillator = vi.fn(() => ({
    type: '',
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
    connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  }))
  this.createGain = vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }))
  this.createBuffer = vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(44100)) }))
  this.createBufferSource = vi.fn(() => ({
    buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  }))
  this.createBiquadFilter = vi.fn(() => ({
    type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn(),
  }))
}

vi.stubGlobal('AudioContext', MockAudioContext)

import {
  INSTRUMENTS, pattern, bpm, isPlaying, currentStep,
  play, pause, clearPattern, toggleCell,
} from './drumEngine.js'

beforeEach(() => {
  vi.useFakeTimers()
  isPlaying.value = false
  currentStep.value = 0
  bpm.value = 120
  pattern.value = Array.from({ length: 9 }, () => new Array(16).fill(false))
})

afterEach(() => {
  pause()
  vi.useRealTimers()
})

describe('INSTRUMENTS', () => {
  it('has 9 entries matching PLAY_FNS length', () => {
    expect(INSTRUMENTS).toHaveLength(9)
  })

  it('contains expected instrument names', () => {
    expect(INSTRUMENTS).toContain('Kick')
    expect(INSTRUMENTS).toContain('Snare')
    expect(INSTRUMENTS).toContain('Crash')
  })
})

describe('play()', () => {
  it('sets isPlaying to true', () => {
    play()
    expect(isPlaying.value).toBe(true)
  })

  it('is idempotent — double call keeps isPlaying true and does not throw', () => {
    play()
    expect(() => play()).not.toThrow()
    expect(isPlaying.value).toBe(true)
  })
})

describe('pause()', () => {
  it('sets isPlaying to false', () => {
    play()
    pause()
    expect(isPlaying.value).toBe(false)
  })

  it('resets currentStep to 0', () => {
    play()
    currentStep.value = 7
    pause()
    expect(currentStep.value).toBe(0)
  })

  it('stops the scheduler timer', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    play()
    pause()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})

describe('clearPattern()', () => {
  it('resets all 9x16 cells to false', () => {
    toggleCell(0, 0)
    toggleCell(4, 8)
    toggleCell(8, 15)
    clearPattern()
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 16; j++) {
        expect(pattern.value[i][j]).toBe(false)
      }
    }
  })

  it('preserves 9 rows and 16 steps after clear', () => {
    clearPattern()
    expect(pattern.value).toHaveLength(9)
    pattern.value.forEach(row => expect(row).toHaveLength(16))
  })
})

describe('toggleCell()', () => {
  it('sets a false cell to true', () => {
    toggleCell(0, 0)
    expect(pattern.value[0][0]).toBe(true)
  })

  it('sets a true cell back to false', () => {
    toggleCell(2, 5)
    toggleCell(2, 5)
    expect(pattern.value[2][5]).toBe(false)
  })

  it('does not mutate other cells', () => {
    toggleCell(3, 7)
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 16; j++) {
        if (i === 3 && j === 7) continue
        expect(pattern.value[i][j]).toBe(false)
      }
    }
  })
})
