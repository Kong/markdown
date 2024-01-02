// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TooltipShortcut from './TooltipShortcut.vue'

describe('<TooltipShortcut />', () => {
  it('renders the shortcut with no keys', async () => {
    const text = 'Shortcut name'

    const wrapper = await mount(TooltipShortcut, {
      props: {
        text,
      },
    })

    expect(wrapper.find('.tooltip-shortcut').isVisible()).toBe(true)
    expect(wrapper.findTestId('shortcut-text').text()).toContain(text)
    expect(wrapper.findTestId('keys').exists()).toBe(false)
  })

  it('does not render the shortcut if the `text` prop does not have a value', async () => {
    const wrapper = await mount(TooltipShortcut, {
      props: {
        text: '',
      },
    })

    expect(wrapper.find('.tooltip-shortcut').exists()).toBe(false)
  })

  it('displays the shortcut text along with a single key', async () => {
    const text = 'Bold'
    const keys = ['B']

    const wrapper = await mount(TooltipShortcut, {
      props: {
        text,
        keys,
      },
    })

    expect(wrapper.find('.tooltip-shortcut').exists()).toBe(true)
    expect(wrapper.findTestId('shortcut-text').text()).toContain(text)
    expect(wrapper.findAll('.meta-key').length).toEqual(1)
    expect(wrapper.findAll('kbd').length).toEqual(keys.length + 1)
  })

  it('displays the shortcut text along with multiple keys', async () => {
    const text = 'Strikethrough'
    const keys = ['Shift', 'X']

    const wrapper = await mount(TooltipShortcut, {
      props: {
        text,
        keys,
      },
    })

    expect(wrapper.find('.tooltip-shortcut').exists()).toBe(true)
    expect(wrapper.findTestId('shortcut-text').text()).toContain(text)
    expect(wrapper.findAll('.meta-key').length).toEqual(1)
    expect(wrapper.findAll('kbd').length).toEqual(keys.length + 1)
  })
})
