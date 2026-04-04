import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PianoOctave from './PianoOctave.vue'

describe('PianoOctave', () => {
  it('renders 7 white keys', () => {
    const wrapper = mount(PianoOctave)
    expect(wrapper.findAll('.white-key')).toHaveLength(7)
  })

  it('renders 5 black keys', () => {
    const wrapper = mount(PianoOctave)
    expect(wrapper.findAll('.black-key')).toHaveLength(5)
  })

  it('shows octave selector by default', () => {
    const wrapper = mount(PianoOctave)
    expect(wrapper.find('.octave-ctl').exists()).toBe(true)
  })

  it('hides octave selector when showOctaveSelector is false', () => {
    const wrapper = mount(PianoOctave, { props: { showOctaveSelector: false } })
    expect(wrapper.find('.octave-ctl').exists()).toBe(false)
  })

  it('displays the current octave value', () => {
    const wrapper = mount(PianoOctave, { props: { octave: 5 } })
    expect(wrapper.find('.octave-val').text()).toBe('5')
  })

  describe('active and root classes', () => {
    it('marks white key as active when noteIdx is in activeIndices', () => {
      // PIANO_WHITE = [3,5,7,8,10,0,2] — index 5 (0=A) is A
      // Pass activeIndices containing A (index 0)
      const wrapper = mount(PianoOctave, {
        props: { activeIndices: new Set([0]) }, // A is active
      })
      const activeWhiteKeys = wrapper.findAll('.white-key.active')
      expect(activeWhiteKeys.length).toBeGreaterThanOrEqual(1)
    })

    it('marks white key as root when noteIdx equals rootIndex', () => {
      // PIANO_WHITE[5] = 0 (A)
      const wrapper = mount(PianoOctave, { props: { rootIndex: 0 } }) // A
      const rootKeys = wrapper.findAll('.white-key.root')
      expect(rootKeys).toHaveLength(1)
    })

    it('marks black key as active when noteIdx is in activeIndices', () => {
      // PIANO_BLACK includes noteIdx 4 (A#)
      const wrapper = mount(PianoOctave, {
        props: { activeIndices: new Set([4]) }, // A# is active
      })
      const activeBlackKeys = wrapper.findAll('.black-key.active')
      expect(activeBlackKeys.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('octave controls', () => {
    it('emits update:octave with octave+1 when + is clicked', async () => {
      const wrapper = mount(PianoOctave, { props: { octave: 4 } })
      const buttons = wrapper.findAll('.octave-ctl button')
      const plusBtn = buttons[1]
      await plusBtn.trigger('click')
      expect(wrapper.emitted('update:octave')).toBeTruthy()
      expect(wrapper.emitted('update:octave')[0]).toEqual([5])
    })

    it('emits update:octave with octave-1 when − is clicked', async () => {
      const wrapper = mount(PianoOctave, { props: { octave: 4 } })
      const buttons = wrapper.findAll('.octave-ctl button')
      const minusBtn = buttons[0]
      await minusBtn.trigger('click')
      expect(wrapper.emitted('update:octave')).toBeTruthy()
      expect(wrapper.emitted('update:octave')[0]).toEqual([3])
    })

    it('clamps octave minimum at 0', async () => {
      const wrapper = mount(PianoOctave, { props: { octave: 0 } })
      const minusBtn = wrapper.findAll('.octave-ctl button')[0]
      await minusBtn.trigger('click')
      expect(wrapper.emitted('update:octave')[0]).toEqual([0])
    })

    it('clamps octave maximum at 9', async () => {
      const wrapper = mount(PianoOctave, { props: { octave: 9 } })
      const plusBtn = wrapper.findAll('.octave-ctl button')[1]
      await plusBtn.trigger('click')
      expect(wrapper.emitted('update:octave')[0]).toEqual([9])
    })
  })

  describe('clickable prop', () => {
    it('emits toggle with noteIdx when clickable=true', async () => {
      const wrapper = mount(PianoOctave, {
        props: { clickable: true },
      })
      await wrapper.find('.white-key').trigger('pointerdown')
      expect(wrapper.emitted('toggle')).toBeTruthy()
    })

    it('does not emit toggle when clickable=false', async () => {
      const wrapper = mount(PianoOctave, {
        props: { clickable: false },
      })
      await wrapper.find('.white-key').trigger('pointerdown')
      expect(wrapper.emitted('toggle')).toBeFalsy()
    })
  })

  describe('dimInactive prop', () => {
    it('adds dim-inactive class to piano when true', () => {
      const wrapper = mount(PianoOctave, { props: { dimInactive: true } })
      expect(wrapper.find('.piano').classes()).toContain('dim-inactive')
    })

    it('does not add dim-inactive class when false', () => {
      const wrapper = mount(PianoOctave, { props: { dimInactive: false } })
      expect(wrapper.find('.piano').classes()).not.toContain('dim-inactive')
    })
  })
})
