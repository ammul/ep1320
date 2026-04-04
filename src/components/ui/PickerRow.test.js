import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PickerRow from './PickerRow.vue'

describe('PickerRow', () => {
  it('renders label text', () => {
    const wrapper = mount(PickerRow, { props: { label: 'Key' } })
    expect(wrapper.find('.picker-label').text()).toBe('Key')
  })

  it('renders slot content inside picker-control', () => {
    const wrapper = mount(PickerRow, {
      props: { label: 'Key' },
      slots: { default: '<select class="test-select"></select>' },
    })
    expect(wrapper.find('.picker-control').exists()).toBe(true)
    expect(wrapper.find('.test-select').exists()).toBe(true)
  })
})
