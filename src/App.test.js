import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'

// drumEngine uses lazy AudioContext but stub it to be safe
vi.stubGlobal('AudioContext', vi.fn(() => ({
  state: 'running',
  currentTime: 0,
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({
    type: '', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
    connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(1)) })),
  createBufferSource: vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
  createBiquadFilter: vi.fn(() => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() })),
  destination: {},
  sampleRate: 44100,
})))

vi.mock('./midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus: ref('unavailable'),
    midiOutputs: ref([]),
    selectedOutputId: ref(null),
    initMidi: vi.fn(),
    disconnectMidi: vi.fn(),
  }
})

import App from './App.vue'
import { isPlaying as drumIsPlaying } from './drumEngine.js'

beforeEach(() => {
  drumIsPlaying.value = false
})

// ── Desktop tab bar ──────────────────────────────────────────────────────────

describe('desktop tab bar', () => {
  it('renders the desktop-tabs nav', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.desktop-tabs').exists()).toBe(true)
  })

  it('renders 9 tabs (all except Settings)', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.findAll('.dt-tab')).toHaveLength(9)
  })

  it('uses shortLabels on desktop tab buttons', () => {
    const wrapper = shallowMount(App)
    const labels = wrapper.findAll('.dt-tab').map(el => el.text())
    expect(labels).toContain('Home')
    expect(labels).toContain('Jam')
    expect(labels).toContain('Scales')
    expect(labels).toContain('Progressions')
    expect(labels).toContain('Drums')
    expect(labels).not.toContain('Settings')
  })

  it('Home tab is active by default', () => {
    const wrapper = shallowMount(App)
    const activeTabs = wrapper.findAll('.dt-tab.active')
    expect(activeTabs).toHaveLength(1)
    expect(activeTabs[0].text()).toBe('Home')
  })

  it('clicking a desktop tab makes it active', async () => {
    const wrapper = shallowMount(App)
    const learnTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Learn')
    await learnTab.trigger('click')
    expect(learnTab.classes()).toContain('active')
  })
})

// ── Drum widget ──────────────────────────────────────────────────────────────

describe('drum widget', () => {
  it('is hidden before drums have ever played', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.drum-widget').exists()).toBe(false)
  })

  it('appears after drumIsPlaying becomes true', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.drum-widget').exists()).toBe(true)
    drumIsPlaying.value = false
    await nextTick()
    // still visible — drumEverPlayed latches true
    expect(wrapper.find('.drum-widget').exists()).toBe(true)
  })

  it('has playing class when drums are playing', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.drum-widget').classes()).toContain('playing')
  })

  it('loses playing class when drums stop', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    drumIsPlaying.value = false
    await nextTick()
    expect(wrapper.find('.drum-widget').classes()).not.toContain('playing')
  })

  it('dw-btn aria-label is Play drums when stopped', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    drumIsPlaying.value = false
    await nextTick()
    expect(wrapper.find('.dw-btn').attributes('aria-label')).toBe('Play drums')
  })

  it('dw-btn aria-label is Pause drums when playing', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.dw-btn').attributes('aria-label')).toBe('Pause drums')
  })
})

// ── Tab switching & settings ─────────────────────────────────────────────────

describe('tab switching', () => {
  it('opening settings records previous tab', async () => {
    const wrapper = shallowMount(App)
    // Go to Learn first
    const learnTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Learn')
    await learnTab.trigger('click')
    // Open settings via icon button
    await wrapper.find('.icon-btn').trigger('click')
    // Close settings
    await wrapper.find('.icon-btn').trigger('click')
    // Should return to Learn
    const learnDtTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Learn')
    expect(learnDtTab.classes()).toContain('active')
  })

  it('closing side menu after tab select', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.burger-btn').trigger('click')
    expect(wrapper.find('.side-menu').classes()).toContain('open')
    const menuItems = wrapper.findAll('.side-menu button').filter(b => b.text())
    await menuItems[0].trigger('click')
    expect(wrapper.find('.side-menu').classes()).not.toContain('open')
  })
})

// ── SPA history ──────────────────────────────────────────────────────────────

describe('SPA history (handlePopState)', () => {
  it('navigates to tab from popstate event', async () => {
    const wrapper = shallowMount(App)
    // Simulate browser back to 'learn'
    const event = new PopStateEvent('popstate', { state: { tab: 'learn' } })
    window.dispatchEvent(event)
    await nextTick()
    const learnTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Learn')
    expect(learnTab.classes()).toContain('active')
  })

  it('ignores popstate for unknown tab ids', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: { tab: 'nonexistent' } })
    window.dispatchEvent(event)
    await nextTick()
    // Should stay on home
    const homeTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Home')
    expect(homeTab.classes()).toContain('active')
  })

  it('ignores popstate with no state', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: null })
    window.dispatchEvent(event)
    await nextTick()
    const homeTab = wrapper.findAll('.dt-tab').find(t => t.text() === 'Home')
    expect(homeTab.classes()).toContain('active')
  })
})
