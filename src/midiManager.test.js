import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  midiStatus, midiOutputs, selectedOutputId, midiChannel, activeInputNotes,
  initMidi, disconnectMidi, noteOn, noteOff, chordOn, chordOff,
} from './midiManager.js'

function makeMockAccess(outputs = [], inputs = []) {
  return {
    onstatechange: null,
    outputs: { values: () => outputs },
    inputs: { values: () => inputs.map(i => ({ onmidimessage: null })) },
  }
}

beforeEach(() => {
  disconnectMidi()
  vi.restoreAllMocks()
})

describe('disconnectMidi', () => {
  it('resets midiStatus to idle', () => {
    midiStatus.value = 'connected'
    disconnectMidi()
    expect(midiStatus.value).toBe('idle')
  })

  it('clears midiOutputs', () => {
    midiOutputs.value = [{ id: '1', name: 'Device' }]
    disconnectMidi()
    expect(midiOutputs.value).toHaveLength(0)
  })

  it('clears selectedOutputId', () => {
    selectedOutputId.value = '1'
    disconnectMidi()
    expect(selectedOutputId.value).toBeNull()
  })

  it('clears activeInputNotes', () => {
    activeInputNotes.value = new Set([60, 64])
    disconnectMidi()
    expect(activeInputNotes.value.size).toBe(0)
  })
})

describe('initMidi', () => {
  it('sets status to unsupported when requestMIDIAccess is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    await initMidi()
    expect(midiStatus.value).toBe('unsupported')
    vi.unstubAllGlobals()
  })

  it('sets status to error when requestMIDIAccess rejects', async () => {
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockRejectedValue(new Error('denied')),
    })
    await initMidi()
    expect(midiStatus.value).toBe('error')
    vi.unstubAllGlobals()
  })

  it('sets status to connected on success', async () => {
    const mockAccess = makeMockAccess()
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    expect(midiStatus.value).toBe('connected')
    vi.unstubAllGlobals()
  })

  it('populates midiOutputs from available outputs', async () => {
    const outputs = [
      { id: '1', name: 'Device A' },
      { id: '2', name: 'Device B' },
    ]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    expect(midiOutputs.value).toHaveLength(2)
    vi.unstubAllGlobals()
  })

  it('selects first output automatically', async () => {
    const outputs = [{ id: 'abc', name: 'Device A' }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    expect(selectedOutputId.value).toBe('abc')
    vi.unstubAllGlobals()
  })

  it('sets selectedOutputId to null when no outputs are available', async () => {
    const mockAccess = makeMockAccess([])
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    expect(selectedOutputId.value).toBeNull()
    vi.unstubAllGlobals()
  })
})

describe('noteOn / noteOff', () => {
  it('noteOn sends correct bytes to the selected output', async () => {
    const sendMock = vi.fn()
    const outputs = [{ id: '1', name: 'Device', send: sendMock }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    midiChannel.value = 0

    noteOn(60, 100)
    expect(sendMock).toHaveBeenCalledWith([0x90, 60, 100])
    vi.unstubAllGlobals()
  })

  it('noteOff sends correct bytes', async () => {
    const sendMock = vi.fn()
    const outputs = [{ id: '1', name: 'Device', send: sendMock }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    midiChannel.value = 0

    noteOff(60)
    expect(sendMock).toHaveBeenCalledWith([0x80, 60, 0])
    vi.unstubAllGlobals()
  })

  it('uses correct channel byte for channel 2', async () => {
    const sendMock = vi.fn()
    const outputs = [{ id: '1', name: 'Device', send: sendMock }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    midiChannel.value = 2

    noteOn(64, 80)
    expect(sendMock).toHaveBeenCalledWith([0x92, 64, 80])
    vi.unstubAllGlobals()
  })

  it('noteOn does nothing when no output is selected', () => {
    selectedOutputId.value = null
    expect(() => noteOn(60, 100)).not.toThrow()
  })
})

describe('chordOn / chordOff', () => {
  it('chordOn sends noteOn for each midi note', async () => {
    const sendMock = vi.fn()
    const outputs = [{ id: '1', name: 'Device', send: sendMock }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    midiChannel.value = 0

    chordOn([60, 64, 67])
    expect(sendMock).toHaveBeenCalledTimes(3)
    expect(sendMock).toHaveBeenCalledWith([0x90, 60, 90])
    expect(sendMock).toHaveBeenCalledWith([0x90, 64, 90])
    expect(sendMock).toHaveBeenCalledWith([0x90, 67, 90])
    vi.unstubAllGlobals()
  })

  it('chordOff sends noteOff for each midi note', async () => {
    const sendMock = vi.fn()
    const outputs = [{ id: '1', name: 'Device', send: sendMock }]
    const mockAccess = makeMockAccess(outputs)
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(mockAccess),
    })
    await initMidi()
    midiChannel.value = 0

    chordOff([60, 64, 67])
    expect(sendMock).toHaveBeenCalledTimes(3)
    vi.unstubAllGlobals()
  })
})
