import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('../midiManager.js', () => ({
  midiStatus: { value: 'unavailable' },
  midiOutputs: { value: [] },
  selectedOutputId: { value: null },
  initMidi: vi.fn(),
  disconnectMidi: vi.fn(),
}))

import SettingsPage from './SettingsPage.vue'
import { displayMode } from '../displayMode.js'
import { soundEnabled } from '../soundEnabled.js'
import { soundStyle } from '../soundStyle.js'

beforeEach(() => {
  displayMode.value = 'ep1320'
  soundEnabled.value = true
  soundStyle.value = 'synth'
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

    it('ep1320 button is active by default', () => {
      const wrapper = mount(SettingsPage)
      const buttons = wrapper.findAll('.option-btn')
      const activeLabels = buttons.filter(b => b.classes('active')).map(b => b.text())
      expect(activeLabels).toContain('EP-1320')
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
      const audioSection = sections[1]
      const onBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'On')
      expect(onBtn.classes()).toContain('active')
    })

    it('Off button is active when sound is disabled', async () => {
      soundEnabled.value = false
      const wrapper = mount(SettingsPage)
      await nextTick()
      const sections = wrapper.findAll('.settings-section')
      const audioSection = sections[1]
      const offBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'Off')
      expect(offBtn.classes()).toContain('active')
    })

    it('clicking Off disables sound', async () => {
      const wrapper = mount(SettingsPage)
      const sections = wrapper.findAll('.settings-section')
      const audioSection = sections[1]
      const offBtn = audioSection.findAll('.option-btn').find(b => b.text() === 'Off')
      await offBtn.trigger('click')
      expect(soundEnabled.value).toBe(false)
    })
  })
})
