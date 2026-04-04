import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote:  vi.fn(),
}))

import { startNote, stopNote } from '@/audio/audioEngine.js'
import { useNotePlayback } from './useNotePlayback.js'

function withSetup(setup) {
  let result
  const Comp = defineComponent({
    setup() { result = setup(); return () => h('div') },
  })
  const wrapper = mount(Comp)
  return { result, wrapper }
}

beforeEach(() => {
  startNote.mockClear()
  stopNote.mockClear()
})

describe('useNotePlayback', () => {
  describe('pressDown()', () => {
    it('calls startNote with the midi value', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(64)
      expect(startNote).toHaveBeenCalledWith(64)
    })

    it('adds the midi to pressedMidi', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(64)
      expect(result.pressedMidi.value.has(64)).toBe(true)
    })
  })

  describe('pressUp()', () => {
    it('calls stopNote with the midi value', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(64)
      result.pressUp(64)
      expect(stopNote).toHaveBeenCalledWith(64)
    })

    it('removes the midi from pressedMidi', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(64)
      result.pressUp(64)
      expect(result.pressedMidi.value.has(64)).toBe(false)
    })
  })

  describe('pressToggle()', () => {
    it('calls pressDown when note is not pressed', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressToggle(60)
      expect(startNote).toHaveBeenCalledWith(60)
      expect(result.pressedMidi.value.has(60)).toBe(true)
    })

    it('calls pressUp when note is already pressed', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(60)
      startNote.mockClear()
      result.pressToggle(60)
      expect(stopNote).toHaveBeenCalledWith(60)
      expect(result.pressedMidi.value.has(60)).toBe(false)
    })
  })

  describe('releaseAll()', () => {
    it('calls stopNote for all pressed notes', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(60)
      result.pressDown(64)
      result.pressDown(67)
      stopNote.mockClear()
      result.releaseAll()
      expect(stopNote).toHaveBeenCalledWith(60)
      expect(stopNote).toHaveBeenCalledWith(64)
      expect(stopNote).toHaveBeenCalledWith(67)
    })

    it('empties pressedMidi', () => {
      const { result } = withSetup(() => useNotePlayback())
      result.pressDown(60)
      result.releaseAll()
      expect(result.pressedMidi.value.size).toBe(0)
    })
  })

  describe('onUnmounted', () => {
    it('calls stopNote for all active notes on unmount', () => {
      const { result, wrapper } = withSetup(() => useNotePlayback())
      result.pressDown(60)
      result.pressDown(64)
      stopNote.mockClear()
      wrapper.unmount()
      expect(stopNote).toHaveBeenCalledWith(60)
      expect(stopNote).toHaveBeenCalledWith(64)
    })
  })
})
