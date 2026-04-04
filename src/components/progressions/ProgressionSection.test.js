import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressionSection from './ProgressionSection.vue'

const PROGRESSIONS = [
  {
    id: 'pop-1',
    label: 'Pop anthem',
    numeral: 'I – V – vi – IV',
    examples: 'Let It Be',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }],
  },
  {
    id: 'pop-2',
    label: '50s doo-wop',
    numeral: 'I – vi – IV – V',
    examples: 'Stand By Me',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }],
  },
]

describe('ProgressionSection', () => {
  it('renders section title', () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major Key Progressions', progressions: PROGRESSIONS, rootNote: 'A', expandedId: null, playingId: null },
    })
    expect(wrapper.find('.prog-section-title').text()).toBe('Major Key Progressions')
  })

  it('renders a ProgressionCard for each progression', () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major Key Progressions', progressions: PROGRESSIONS, rootNote: 'A', expandedId: null, playingId: null },
    })
    expect(wrapper.findAll('.prog-card')).toHaveLength(2)
  })

  it('does not render section when progressions is empty', () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major Key Progressions', progressions: [], rootNote: 'A', expandedId: null, playingId: null },
    })
    expect(wrapper.find('.prog-section').exists()).toBe(false)
  })

  it('passes isExpanded=true to the matching card', () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major', progressions: PROGRESSIONS, rootNote: 'A', expandedId: 'pop-1', playingId: null },
    })
    const cards = wrapper.findAll('.prog-card')
    expect(cards[0].classes()).toContain('expanded')
    expect(cards[1].classes()).not.toContain('expanded')
  })

  it('passes isPlaying=true to the matching card', () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major', progressions: PROGRESSIONS, rootNote: 'A', expandedId: null, playingId: 'pop-2' },
    })
    const cards = wrapper.findAll('.prog-card')
    expect(cards[0].classes()).not.toContain('playing')
    expect(cards[1].classes()).toContain('playing')
  })

  it('bubbles toggle-expand event with progression id', async () => {
    const wrapper = mount(ProgressionSection, {
      props: { title: 'Major', progressions: PROGRESSIONS, rootNote: 'A', expandedId: null, playingId: null },
    })
    await wrapper.findAll('.prog-card-header')[0].trigger('click')
    expect(wrapper.emitted('toggle-expand')).toBeTruthy()
    expect(wrapper.emitted('toggle-expand')[0]).toEqual(['pop-1'])
  })
})
