import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

vi.mock('@/audio/drumEngine.js', async () => {
  const { ref } = await import('vue')
  return {
    isPlaying:   ref(false),
    pattern:     ref(Array.from({ length: 8 }, () => new Array(16).fill(false))),
    currentStep: ref(0),
    play:        vi.fn(),
    pause:       vi.fn(),
  }
})

import LearnMode from './LearnMode.vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { isPlaying as drumIsPlaying, pattern as drumPattern, play as drumPlay, pause as drumPause } from '@/audio/drumEngine.js'

beforeEach(async () => {
  vi.clearAllMocks()
  drumIsPlaying.value = false
  drumPattern.value = Array.from({ length: 8 }, () => new Array(16).fill(false))
})

// ── Step navigation ─────────────────────────────────────────────────────────

describe('step navigation', () => {
  it('renders 7 step buttons', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')).toHaveLength(7)
  })

  it('step labels match the expected order', () => {
    const wrapper = mount(LearnMode)
    const labels = wrapper.findAll('.step-label').map(el => el.text())
    expect(labels).toEqual(['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats'])
  })

  it('first step is active by default', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('active')
  })

  it('clicking a step marks it active and prior steps as done', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[2].trigger('click')
    expect(wrapper.findAll('.step-btn')[2].classes()).toContain('active')
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('done')
  })

  it('Next button advances the step', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.find('.nav-btn:last-child').trigger('click')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('active')
  })

  it('Back button is disabled on the first step', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.nav-btn').attributes('disabled')).toBeDefined()
  })

  it('step counter reflects current position', async () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.step-counter').text()).toBe('1 / 7')
    await wrapper.findAll('.step-btn')[3].trigger('click')
    expect(wrapper.find('.step-counter').text()).toBe('4 / 7')
  })
})

// ── Step 1: Root Notes ───────────────────────────────────────────────────────

describe('Step 1: Root Notes', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.note-pill')).toHaveLength(12)
  })

  it('shows hint text when no note is selected', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.rr-hint').exists()).toBe(true)
  })

  it('shows root name after picking a note', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.note-pill')[0].trigger('pointerdown')
    expect(wrapper.find('.rr-name').text()).toBe('C')
    expect(wrapper.find('.rr-hint').exists()).toBe(false)
  })

  it('calls playNote with the correct MIDI note', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.note-pill')[2].trigger('pointerdown') // B (index 2, A-based)
    expect(playNote).toHaveBeenCalledWith(71) // 60 + NOTE_TO_SEMI[2] = 60 + 11
  })

  it('selected note gets the from class', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.note-pill')[5].trigger('pointerdown') // F
    expect(wrapper.findAll('.note-pill')[5].classes()).toContain('from')
    expect(wrapper.findAll('.note-pill')[0].classes()).not.toContain('from')
  })

  it('sharp notes have the sharp class', () => {
    const wrapper = mount(LearnMode)
    const pills = wrapper.findAll('.note-pill')
    // NOTES is A-based: A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
    expect(pills[1].classes()).toContain('sharp')  // A#
    expect(pills[4].classes()).toContain('sharp')  // C#
    expect(pills[0].classes()).not.toContain('sharp') // A
    expect(pills[2].classes()).not.toContain('sharp') // B
  })

  it('shows the octave button after picking a note', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.note-pill')[0].trigger('pointerdown')
    expect(wrapper.find('.rr-octave-btn').exists()).toBe(true)
  })
})

// ── Step 2: Intervals ────────────────────────────────────────────────────────

describe('Step 2: Intervals', () => {
  async function goToIntervals(wrapper) {
    await wrapper.findAll('.step-btn')[1].trigger('click')
  }

  it('renders 12 note buttons in the strip', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    expect(wrapper.findAll('.note-strip .note-pill')).toHaveLength(12)
  })

  it('shows the interval reference grid with 11 entries', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    expect(wrapper.findAll('.ref-item')).toHaveLength(11)
  })

  it('clicking a ref interval highlights it and shows interval info', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    // INTERVALS[6] = Perfect 5th (semi=7), which is .ref-item index 6
    await wrapper.findAll('.ref-item')[6].trigger('click')
    expect(wrapper.findAll('.ref-item')[6].classes()).toContain('highlight')
    expect(wrapper.find('.iv-name').text()).toBe('Perfect 5th')
  })

  it('clicking a ref interval calls playChord with correct notes', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    // First ref-item = Minor 2nd (semi=1)
    await wrapper.findAll('.ref-item')[0].trigger('click')
    expect(playChord).toHaveBeenCalledWith([60, 61])
  })

  it('clicking the same ref interval again deselects it', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    await wrapper.findAll('.ref-item')[0].trigger('click')
    await wrapper.findAll('.ref-item')[0].trigger('click')
    expect(wrapper.findAll('.ref-item')[0].classes()).not.toContain('highlight')
    expect(wrapper.find('.iv-name').exists()).toBe(false)
  })

  it('picks first note on first tap and sets from class', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    expect(pills[0].classes()).toContain('from')
  })

  it('shows intervalInfo after picking two different notes', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    await pills[4].trigger('pointerdown') // E = Major 3rd (4 semitones)
    expect(wrapper.find('.iv-name').text()).toBe('Major 3rd')
    expect(wrapper.find('.iv-path').text()).toBe('C → E')
  })

  it('shows intervalInfo for minor 3rd', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C
    await pills[3].trigger('pointerdown') // D# = Minor 3rd (3 semitones)
    expect(wrapper.find('.iv-name').text()).toBe('Minor 3rd')
  })

  it('tapping same note again resets from and starts over', async () => {
    const wrapper = mount(LearnMode)
    await goToIntervals(wrapper)
    const pills = wrapper.findAll('.note-pill')
    await pills[0].trigger('pointerdown') // C -> from
    await pills[4].trigger('pointerdown') // E -> to (interval shown)
    await pills[7].trigger('pointerdown') // G -> resets, now from=G
    expect(pills[7].classes()).toContain('from')
    expect(wrapper.find('.iv-name').exists()).toBe(false)
    expect(wrapper.find('.iv-hint').text()).toBe('Now pick a second note')
  })
})

// ── Step 3: Scales ───────────────────────────────────────────────────────────

describe('Step 3: Scales', () => {
  async function goToScales(wrapper) {
    await wrapper.findAll('.step-btn')[2].trigger('click')
  }

  it('renders scale selector tabs', async () => {
    const wrapper = mount(LearnMode)
    await goToScales(wrapper)
    expect(wrapper.findAll('.scale-tab').length).toBeGreaterThan(0)
  })

  it('renders scale display tiles for all 12 chromatic notes', async () => {
    const wrapper = mount(LearnMode)
    await goToScales(wrapper)
    expect(wrapper.findAll('.scale-tile')).toHaveLength(12)
  })

  it('Major scale highlights 7 notes', async () => {
    const wrapper = mount(LearnMode)
    await goToScales(wrapper)
    // Major scale from C (root=0): C D E F G A B = 7 notes in scale + root
    expect(wrapper.findAll('.scale-tile.active').length).toBe(7)
  })

  it('C major scale has root class on C tile', async () => {
    const wrapper = mount(LearnMode)
    await goToScales(wrapper)
    const rootTiles = wrapper.findAll('.scale-tile.root')
    expect(rootTiles).toHaveLength(1)
  })
})

// ── Step 7: Beats ────────────────────────────────────────────────────────────

describe('Step 7: Beats', () => {
  async function goToBeats(wrapper) {
    await wrapper.findAll('.step-btn')[6].trigger('click')
  }

  it('renders 3 beat pattern cards', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    expect(wrapper.findAll('.beat-pattern')).toHaveLength(3)
  })

  it('each beat pattern has Play and Edit buttons', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    const cards = wrapper.findAll('.beat-pattern')
    for (const card of cards) {
      expect(card.find('.bp-play-btn').exists()).toBe(true)
      expect(card.find('.bp-edit-btn').exists()).toBe(true)
    }
  })

  it('loadBeat sets the drum pattern correctly for basic rock beat', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    // Basic rock: kick on 1,9 (0-indexed: 0,8); snare on 5,13 (4,12); hi-hat every other
    expect(drumPattern.value[0][0]).toBe(true)   // kick beat 1
    expect(drumPattern.value[0][8]).toBe(true)   // kick beat 3
    expect(drumPattern.value[0][4]).toBe(false)  // no kick on beat 2
    expect(drumPattern.value[1][4]).toBe(true)   // snare beat 2
    expect(drumPattern.value[1][12]).toBe(true)  // snare beat 4
    expect(drumPattern.value[3][0]).toBe(true)   // hi-hat on
    expect(drumPattern.value[3][1]).toBe(false)  // hi-hat off
    expect(drumPattern.value[3][2]).toBe(true)   // hi-hat on
  })

  it('rows 4–8 are all silent in built drum pattern', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    for (let r = 4; r < 9; r++) {
      expect(drumPattern.value[r].every(s => s === false)).toBe(true)
    }
  })

  it('loadBeat starts drum playback', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalled()
  })

  it('loading the same pattern twice unloads it without calling play again', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalledTimes(1)
  })

  it('navigating away from beats step pauses drums if playing', async () => {
    drumIsPlaying.value = true
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.step-btn')[0].trigger('click')
    expect(drumPause).toHaveBeenCalled()
  })

  it('editBeat emits navigate event with drums', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-edit-btn')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0]).toEqual(['drums'])
  })

  it('four-on-the-floor pattern has kick on all 4 beats', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[1].trigger('click')
    // Four-on-the-floor: kick on steps 0, 4, 8, 12
    expect(drumPattern.value[0][0]).toBe(true)
    expect(drumPattern.value[0][4]).toBe(true)
    expect(drumPattern.value[0][8]).toBe(true)
    expect(drumPattern.value[0][12]).toBe(true)
  })
})
