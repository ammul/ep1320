import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressionCard from './ProgressionCard.vue'

const PROGRESSION = {
  id: 'pop-1',
  label: 'Pop anthem',
  numeral: 'I – V – vi – IV',
  examples: 'Let It Be · No Woman No Cry',
  chords: [
    { degree: 0, type: 'maj', numeral: 'I' },
    { degree: 7, type: 'maj', numeral: 'V' },
    { degree: 9, type: 'min', numeral: 'vi' },
    { degree: 5, type: 'maj', numeral: 'IV' },
  ],
}

describe('ProgressionCard', () => {
  it('renders label and numeral', () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: false },
    })
    expect(wrapper.find('.prog-card-label').text()).toBe('Pop anthem')
    expect(wrapper.find('.prog-card-numeral').text()).toBe('I – V – vi – IV')
  })

  it('does not show body when collapsed', () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: false },
    })
    expect(wrapper.find('.prog-card-body').exists()).toBe(false)
  })

  it('shows body with examples and chord pills when expanded', () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: true, isPlaying: false },
    })
    expect(wrapper.find('.prog-card-body').exists()).toBe(true)
    expect(wrapper.find('.prog-card-examples').text()).toBe('Let It Be · No Woman No Cry')
    const pills = wrapper.findAll('.chord-pill')
    expect(pills).toHaveLength(4)
    expect(pills[0].text()).toBe('I')
  })

  it('applies playing class when isPlaying=true', () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: true },
    })
    expect(wrapper.find('.prog-card').classes()).toContain('playing')
  })

  it('emits toggle-expand when header is clicked', async () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: false },
    })
    await wrapper.find('.prog-card-header').trigger('click')
    expect(wrapper.emitted('toggle-expand')).toBeTruthy()
  })

  it('emits play when play button clicked while not playing', async () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: false },
    })
    await wrapper.find('.ctrl-btn').trigger('click')
    expect(wrapper.emitted('play')).toBeTruthy()
  })

  it('emits stop when play button clicked while playing', async () => {
    const wrapper = mount(ProgressionCard, {
      props: { progression: PROGRESSION, rootNote: 'A', isExpanded: false, isPlaying: true },
    })
    await wrapper.find('.ctrl-btn').trigger('click')
    expect(wrapper.emitted('stop')).toBeTruthy()
  })
})
