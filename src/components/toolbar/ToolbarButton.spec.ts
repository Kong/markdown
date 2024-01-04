import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ToolbarButton from './ToolbarButton.vue'

describe('<ToolbarButton />', () => {
  it('renders the default button', async () => {
    const slotContent = 'This is the button text'

    const wrapper = mount(ToolbarButton, {
      slots: {
        default: h('button', {}, slotContent),
      },
    })

    expect(wrapper.find('button.toolbar-button').isVisible()).toBe(true)
    expect(wrapper.find('button.toolbar-button').attributes('tabindex')).toEqual('0')
    expect(wrapper.find('button.toolbar-button').attributes('type')).toEqual('button')
    expect(wrapper.find('button.toolbar-button').classes('primary')).toBe(false)
    expect(wrapper.find('button.toolbar-button').classes('secondary')).toBe(true)
    expect(wrapper.find('button.toolbar-button').classes('has-text')).toBe(false)
    expect(wrapper.find('button').text()).toEqual(slotContent)
  })

  describe('props', () => {
    it('renders the non-icon button', async () => {
      const slotContent = 'This is the button text'

      const wrapper = mount(ToolbarButton, {
        props: {
          icon: false,
        },
        slots: {
          default: h('button', {}, slotContent),
        },
      })

      expect(wrapper.find('button.toolbar-button').isVisible()).toBe(true)
      expect(wrapper.find('button.toolbar-button').attributes('tabindex')).toEqual('0')
      expect(wrapper.find('button.toolbar-button').attributes('type')).toEqual('button')
      expect(wrapper.find('button.toolbar-button').classes('has-text')).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)
    })

    it('renders the `primary` appearance', async () => {
      const slotContent = 'This is the button text'

      const wrapper = mount(ToolbarButton, {
        props: {
          icon: false,
          appearance: 'primary',
        },
        slots: {
          default: h('button', {}, slotContent),
        },
      })

      expect(wrapper.find('button.toolbar-button').isVisible()).toBe(true)
      expect(wrapper.find('button.toolbar-button').attributes('tabindex')).toEqual('0')
      expect(wrapper.find('button.toolbar-button').attributes('type')).toEqual('button')
      expect(wrapper.find('button.toolbar-button').classes('primary')).toBe(true)
      expect(wrapper.find('button.toolbar-button').classes('secondary')).toBe(false)
      expect(wrapper.find('button.toolbar-button').classes('has-text')).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)
    })
  })
})
