import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChordCardBody from './ChordCardBody.vue'
import { displayMode } from '../state/displayMode.js'
import { buildRows } from '../utils/musicUtils.js'

const baseProps = {
  rows: buildRows(new Set([3, 7, 10]), 3), // C major: C E G, root=C
  pressLabels: ['1', '5', '8'],
  noteNames: ['C', 'E', 'G'],
  chordRootIdx: 3, // C
  chordType: 'maj',
}

beforeEach(() => {
  displayMode.value = 'pad'
})

describe('ChordCardBody - pad mode', () => {
  it('renders the mini pad grid', () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    expect(wrapper.find('.mini-grid').exists()).toBe(true)
  })

  it('renders 4 rows of 3 pads each', () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    const rows = wrapper.findAll('.mini-row')
    expect(rows).toHaveLength(4)
    for (const row of rows) {
      expect(row.findAll('.mini-pad')).toHaveLength(3)
    }
  })

  it('renders press labels', () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    expect(wrapper.find('.press-labels').exists()).toBe(true)
    const badges = wrapper.findAll('.press-badge')
    expect(badges).toHaveLength(baseProps.pressLabels.length)
  })

  it('active pads have the active class', () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    const activePads = wrapper.findAll('.mini-pad.active')
    expect(activePads.length).toBe(3)
  })

  it('root pad has the root class', () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    const rootPads = wrapper.findAll('.mini-pad.root')
    expect(rootPads.length).toBe(1)
  })
})

describe('ChordCardBody - notes mode', () => {
  it('renders note badges', async () => {
    displayMode.value = 'notes'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    expect(wrapper.find('.note-badges').exists()).toBe(true)
    const badges = wrapper.findAll('.note-badge')
    expect(badges).toHaveLength(baseProps.noteNames.length)
  })

  it('displays correct note names', async () => {
    displayMode.value = 'notes'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    const badgeTexts = wrapper.findAll('.note-badge').map(b => b.text())
    expect(badgeTexts).toContain('C')
    expect(badgeTexts).toContain('E')
    expect(badgeTexts).toContain('G')
  })

  it('root note badge has root class', async () => {
    displayMode.value = 'notes'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    const rootBadges = wrapper.findAll('.note-badge.root')
    expect(rootBadges).toHaveLength(1)
    expect(rootBadges[0].text()).toBe('C')
  })

  it('does not render mini-grid in notes mode', async () => {
    displayMode.value = 'notes'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    expect(wrapper.find('.mini-grid').exists()).toBe(false)
  })
})

describe('ChordCardBody - display mode switching', () => {
  it('switches from pad to notes mode', async () => {
    const wrapper = mount(ChordCardBody, { props: baseProps })
    expect(wrapper.find('.mini-grid').exists()).toBe(true)

    displayMode.value = 'notes'
    await nextTick()

    expect(wrapper.find('.mini-grid').exists()).toBe(false)
    expect(wrapper.find('.note-badges').exists()).toBe(true)
  })

  it('switches to guitar mode and renders chord diagram', async () => {
    displayMode.value = 'guitar'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    expect(wrapper.find('.mini-grid').exists()).toBe(false)
    expect(wrapper.find('.note-badges').exists()).toBe(false)
    // GuitarChordDiagram should be rendered
    expect(wrapper.findComponent({ name: 'GuitarChordDiagram' }).exists()).toBe(true)
  })

  it('falls back to piano mode for unknown display modes', async () => {
    displayMode.value = 'piano'
    const wrapper = mount(ChordCardBody, { props: baseProps })
    await nextTick()
    expect(wrapper.find('.mini-grid').exists()).toBe(false)
    expect(wrapper.find('.note-badges').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PianoOctave' }).exists()).toBe(true)
  })
})
