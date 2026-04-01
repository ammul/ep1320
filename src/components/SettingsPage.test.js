import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus: ref('unavailable'),
    midiOutputs: ref([]),
    selectedOutputId: ref(null),
    initMidi: vi.fn(),
    disconnectMidi: vi.fn(),
  }
})

import SettingsPage from './SettingsPage.vue'
import { displayMode } from '../displayMode.js'
import { soundEnabled } from '../soundEnabled.js'
import { soundStyle } from '../soundStyle.js'
import { octave } from '../octave.js'

beforeEach(() => {
  displayMode.value = 'pad'
  soundEnabled.value = true
  soundStyle.value = 'synth'
  octave.value = 4
})

describe('SettingsPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(SettingsPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(SettingsPage)
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  describe('display mode buttons', () => {
    it('renders four display mode options', () => {
      const wrapper = mount(SettingsPage)
      const displaySection = wrapper.find('.settings-section')
      const buttons = displaySection.findAll('.option-btn')
      expect(buttons.length).toBeGreaterThanOrEqual(4)
    })

    it('pad button is active by default', () => {
      const wrapper = mount(SettingsPage)
      const buttons = wrapper.findAll('.option-btn')
      const activeLabels = buttons.filter(b => b.classes('active')).map(b => b.text())
      expect(activeLabels).toContain('Pad')
    })

    it('clicking Notes updates displayMode', async () => {
      const wrapper = mount(SettingsPage)
      const notesBtn = wrapper.findAll('.option-btn').find(b => b.text() === 'Notes')
      expect(notesBtn).toBeDefined()
      await notesBtn.trigger('click')
      expect(displayMode.value).toBe('notes')
    })

    it('clicking Guitar updates displayMode', async () => {
      const wrapper = mount(SettingsPage)
      const guitarBtn = wrapper.findAll('.option-btn').find(b => b.text() === 'Guitar')
      expect(guitarBtn).toBeDefined()
      await guitarBtn.trigger('click')
      expect(displayMode.value).toBe('guitar')
    })
  })

  describe('sound toggle', () => {
    it('On button is active when sound is enabled', () => {
      soundEnabled.value = true
      const wrapper = mount(SettingsPage)
      const sections = wrapper.findAll('.settings-section')
      const audioSection = sections.find(s => s.find('h3').text() === 'Audio')
      const onBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'On')
      expect(onBtn.classes()).toContain('active')
    })

    it('Off button is active when sound is disabled', async () => {
      soundEnabled.value = false
      const wrapper = mount(SettingsPage)
      await nextTick()
      const sections = wrapper.findAll('.settings-section')
      const audioSection = sections.find(s => s.find('h3').text() === 'Audio')
      const offBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'Off')
      expect(offBtn.classes()).toContain('active')
    })

    it('clicking Off disables sound', async () => {
      const wrapper = mount(SettingsPage)
      const sections = wrapper.findAll('.settings-section')
      const audioSection = sections.find(s => s.find('h3').text() === 'Audio')
      const offBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'Off')
      await offBtn.trigger('click')
      expect(soundEnabled.value).toBe(false)
    })
  })

  describe('octave control', () => {
    it('is not visible when MIDI is not connected', () => {
      const wrapper = mount(SettingsPage)
      expect(wrapper.find('.octave-row').exists()).toBe(false)
    })

    it('is visible when MIDI is connected', async () => {
      const { midiStatus } = await import('../midiManager.js')
      midiStatus.value = 'connected'
      const wrapper = mount(SettingsPage)
      await nextTick()
      expect(wrapper.find('.octave-row').exists()).toBe(true)
      midiStatus.value = 'unavailable'
    })

    it('increments octave when + is clicked', async () => {
      const { midiStatus } = await import('../midiManager.js')
      midiStatus.value = 'connected'
      octave.value = 4
      const wrapper = mount(SettingsPage)
      await nextTick()
      const buttons = wrapper.find('.octave-row').findAll('.octave-btn')
      await buttons[1].trigger('click')
      expect(octave.value).toBe(5)
      midiStatus.value = 'unavailable'
    })

    it('decrements octave when − is clicked', async () => {
      const { midiStatus } = await import('../midiManager.js')
      midiStatus.value = 'connected'
      octave.value = 4
      const wrapper = mount(SettingsPage)
      await nextTick()
      const buttons = wrapper.find('.octave-row').findAll('.octave-btn')
      await buttons[0].trigger('click')
      expect(octave.value).toBe(3)
      midiStatus.value = 'unavailable'
    })

    it('does not go below 0', async () => {
      const { midiStatus } = await import('../midiManager.js')
      midiStatus.value = 'connected'
      octave.value = 0
      const wrapper = mount(SettingsPage)
      await nextTick()
      const buttons = wrapper.find('.octave-row').findAll('.octave-btn')
      await buttons[0].trigger('click')
      expect(octave.value).toBe(0)
      midiStatus.value = 'unavailable'
    })

    it('does not go above 9', async () => {
      const { midiStatus } = await import('../midiManager.js')
      midiStatus.value = 'connected'
      octave.value = 9
      const wrapper = mount(SettingsPage)
      await nextTick()
      const buttons = wrapper.find('.octave-row').findAll('.octave-btn')
      await buttons[1].trigger('click')
      expect(octave.value).toBe(9)
      midiStatus.value = 'unavailable'
    })
  })
})
