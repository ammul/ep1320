import { describe, it, expect, beforeEach, vi } from 'vitest'

// Track the ctx instance created during module init
let capturedCtx = null

function makeGain() {
  return {
    gain: {
      value: 0.3,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
    },
    connect: vi.fn(),
  }
}

const MockAudioContext = vi.fn(function () {
  capturedCtx = {
    state: 'running',
    currentTime: 0,
    resume: vi.fn(),
    destination: {},
    createOscillator: vi.fn(function () {
      return {
        type: '',
        frequency: {
          value: 0,
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
    }),
    createGain: vi.fn(makeGain),
    createDynamicsCompressor: vi.fn(function () {
      return {
        threshold: { value: 0 },
        knee: { value: 0 },
        ratio: { value: 0 },
        attack: { value: 0 },
        release: { value: 0 },
        connect: vi.fn(),
      }
    }),
  }
  return capturedCtx
})

vi.stubGlobal('AudioContext', MockAudioContext)

import { startNote, stopNote, stopAllNotes, playNote } from './audioEngine.js'
import { soundEnabled } from './soundEnabled.js'
import { soundStyle } from './soundStyle.js'
import { midiStatus } from './midiManager.js'

beforeEach(() => {
  soundEnabled.value = true
  soundStyle.value = 'synth'
  midiStatus.value = 'idle'
  // Clear call counts but keep the captured ctx reference
  if (capturedCtx) {
    capturedCtx.createOscillator.mockClear()
    capturedCtx.createGain.mockClear()
  }
})

function ctx() {
  return capturedCtx
}

describe('midiToFreq (via startNote)', () => {
  it('A4 (midi 69) produces 440 Hz oscillator', () => {
    startNote(69)
    const osc = ctx().createOscillator.mock.results[0]?.value
    expect(osc).toBeDefined()
    expect(osc.frequency.value).toBeCloseTo(440, 1)
  })

  it('A5 (midi 81) produces 880 Hz oscillator', () => {
    startNote(81)
    const osc = ctx().createOscillator.mock.results[0]?.value
    expect(osc).toBeDefined()
    expect(osc.frequency.value).toBeCloseTo(880, 1)
  })
})

describe('startNote', () => {
  it('creates oscillators when sound is enabled', () => {
    startNote(60)
    expect(ctx().createOscillator).toHaveBeenCalled()
  })

  it('does not create oscillators when sound is disabled', () => {
    soundEnabled.value = false
    startNote(60)
    expect(ctx().createOscillator).not.toHaveBeenCalled()
  })

  it('does not create oscillators when MIDI is connected', () => {
    midiStatus.value = 'connected'
    startNote(60)
    expect(ctx().createOscillator).not.toHaveBeenCalled()
  })

  it('returns a non-zero generation number', () => {
    const gen = startNote(60)
    expect(gen).toBeGreaterThan(0)
  })

  it('returns 0 when sound is disabled', () => {
    soundEnabled.value = false
    expect(startNote(60)).toBe(0)
  })
})

describe('sound styles', () => {
  it('synth uses triangle oscillator', () => {
    soundStyle.value = 'synth'
    startNote(60)
    const oscs = ctx().createOscillator.mock.results.map(r => r.value)
    expect(oscs.some(o => o.type === 'triangle')).toBe(true)
  })

  it('piano uses sine oscillator', () => {
    soundStyle.value = 'piano'
    startNote(60)
    const oscs = ctx().createOscillator.mock.results.map(r => r.value)
    expect(oscs.some(o => o.type === 'sine')).toBe(true)
  })

  it('bell uses sine oscillator', () => {
    soundStyle.value = 'bell'
    startNote(60)
    const oscs = ctx().createOscillator.mock.results.map(r => r.value)
    expect(oscs.some(o => o.type === 'sine')).toBe(true)
  })

  it('pluck uses sawtooth oscillator', () => {
    soundStyle.value = 'pluck'
    startNote(60)
    const oscs = ctx().createOscillator.mock.results.map(r => r.value)
    expect(oscs.some(o => o.type === 'sawtooth')).toBe(true)
  })

  it('bell creates 3 oscillators (fundamental + 2 harmonics)', () => {
    soundStyle.value = 'bell'
    startNote(60)
    expect(ctx().createOscillator).toHaveBeenCalledTimes(3)
  })

  it('synth creates 2 oscillators (fundamental + harmonic)', () => {
    soundStyle.value = 'synth'
    startNote(60)
    expect(ctx().createOscillator).toHaveBeenCalledTimes(2)
  })

  it('pluck creates 1 oscillator', () => {
    soundStyle.value = 'pluck'
    startNote(60)
    expect(ctx().createOscillator).toHaveBeenCalledTimes(1)
  })
})

describe('stopNote', () => {
  it('schedules gain fadeout on the note gain node', () => {
    startNote(50)
    // The note's gainNode is always the first gain created in startNote
    const gainNode = ctx().createGain.mock.results[0].value
    gainNode.gain.exponentialRampToValueAtTime.mockClear()
    stopNote(50)
    expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
  })

  it('does nothing if note was never started', () => {
    expect(() => stopNote(99)).not.toThrow()
  })

  it('ignores stale generation number', () => {
    soundStyle.value = 'synth'
    startNote(55)
    // Get the note's gainNode (always index 0) and record call count after startNote
    const gainNode = ctx().createGain.mock.results[0].value
    const callsBefore = gainNode.gain.exponentialRampToValueAtTime.mock.calls.length
    stopNote(55, 999999) // wrong gen - should be ignored
    const callsAfter = gainNode.gain.exponentialRampToValueAtTime.mock.calls.length
    expect(callsAfter).toBe(callsBefore) // no new fadeout calls
  })
})

describe('stopAllNotes', () => {
  it('does not throw when no notes are active', () => {
    expect(() => stopAllNotes()).not.toThrow()
  })

  it('does not throw when multiple notes are active', () => {
    startNote(60)
    startNote(64)
    expect(() => stopAllNotes()).not.toThrow()
  })
})
