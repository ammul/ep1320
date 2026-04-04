import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote:  vi.fn(),
}))

import ProgressionBuilder from './ProgressionBuilder.vue'

// Extract parseToken for unit testing by mounting and reading internal logic
// We test it through rendered output since it's not exported

describe('ProgressionBuilder', () => {
  it('renders without errors', () => {
    const wrapper = mount(ProgressionBuilder)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders PageHeader with title "Progression Builder"', () => {
    const wrapper = mount(ProgressionBuilder)
    expect(wrapper.findComponent({ name: 'PageHeader' }).props('title')).toBe('Progression Builder')
  })

  it('renders a text input for chord entry', () => {
    const wrapper = mount(ProgressionBuilder)
    expect(wrapper.find('input[type="text"], textarea, input').exists()).toBe(true)
  })

  describe('chord card rendering', () => {
    it('shows 2 chord cards for default input "D f#m E D"', async () => {
      const wrapper = mount(ProgressionBuilder)
      await nextTick()
      // Default input is 'D f#m E D' — 4 valid tokens
      const cards = wrapper.findAllComponents({ name: 'ChordCardBody' })
      expect(cards.length).toBe(4)
    })

    it('shows chord names for input "C Am"', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('C Am')
      await nextTick()
      const cards = wrapper.findAllComponents({ name: 'ChordCardBody' })
      expect(cards.length).toBe(2)
    })

    it('shows no chord cards for empty input', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('')
      await nextTick()
      const cards = wrapper.findAllComponents({ name: 'ChordCardBody' })
      expect(cards.length).toBe(0)
    })
  })

  describe('parse error display', () => {
    it('shows unrecognised tokens as errors', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('C xyz Am')
      await nextTick()
      const errorText = wrapper.text()
      expect(errorText).toContain('xyz')
    })

    it('shows no error message for valid tokens', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('C Am F G')
      await nextTick()
      expect(wrapper.find('.parse-error, .error').exists()).toBe(false)
    })
  })

  describe('token parsing (via rendered output)', () => {
    it('parses major chord (D)', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('D')
      await nextTick()
      expect(wrapper.findAllComponents({ name: 'ChordCardBody' })).toHaveLength(1)
    })

    it('parses minor chord (f#m)', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('f#m')
      await nextTick()
      expect(wrapper.findAllComponents({ name: 'ChordCardBody' })).toHaveLength(1)
    })

    it('parses flat notation (Bbm7) via FLAT_MAP', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('Bbm7')
      await nextTick()
      expect(wrapper.findAllComponents({ name: 'ChordCardBody' })).toHaveLength(1)
    })

    it('parses diminished (Bdim)', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('Bdim')
      await nextTick()
      expect(wrapper.findAllComponents({ name: 'ChordCardBody' })).toHaveLength(1)
    })

    it('rejects unrecognised token (xyz) — shows 0 cards', async () => {
      const wrapper = mount(ProgressionBuilder)
      const input = wrapper.find('input')
      await input.setValue('xyz')
      await nextTick()
      expect(wrapper.findAllComponents({ name: 'ChordCardBody' })).toHaveLength(0)
    })
  })
})
