import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreTabs from './GenreTabs.vue'

const GENRES = [
  { id: 'all', label: 'All' },
  { id: 'pop', label: 'Pop' },
  { id: 'rock', label: 'Rock' },
]

describe('GenreTabs', () => {
  it('renders a button for each genre', () => {
    const wrapper = mount(GenreTabs, { props: { genres: GENRES, modelValue: 'all' } })
    const buttons = wrapper.findAll('.genre-btn')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('All')
    expect(buttons[1].text()).toBe('Pop')
    expect(buttons[2].text()).toBe('Rock')
  })

  it('marks the active genre with active class', () => {
    const wrapper = mount(GenreTabs, { props: { genres: GENRES, modelValue: 'pop' } })
    const buttons = wrapper.findAll('.genre-btn')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[1].classes()).toContain('active')
    expect(buttons[2].classes()).not.toContain('active')
  })

  it('emits update:modelValue with genre id on click', async () => {
    const wrapper = mount(GenreTabs, { props: { genres: GENRES, modelValue: 'all' } })
    await wrapper.findAll('.genre-btn')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['rock'])
  })
})
