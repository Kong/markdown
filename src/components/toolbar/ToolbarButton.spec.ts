// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ToolbarButton from './ToolbarButton.vue'

describe('<ToolbarButton />', () => {
  it('renders the default button', async () => {
    const slotContent = 'This is the button text'

    const wrapper = await mount(ToolbarButton, {
      slots: {
        default: h('button', {}, slotContent),
      },
    })

    expect(wrapper.find('button.toolbar-button').isVisible()).toBe(true)
    expect(wrapper.find('button.toolbar-button').attributes('tabindex')).toEqual('0')
    expect(wrapper.find('button.toolbar-button').attributes('type')).toEqual('button')
    expect(wrapper.find('button.toolbar-button').attributes('class')).not.toContain('primary')
    expect(wrapper.find('button.toolbar-button').attributes('class')).toContain('secondary')
    expect(wrapper.find('button.toolbar-button').attributes('class')).not.toContain('has-text')
    expect(wrapper.find('button').text()).toEqual(slotContent)
  })

  describe('props', () => {
    it('renders the non-icon button', async () => {
      const slotContent = 'This is the button text'

      const wrapper = await mount(ToolbarButton, {
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
      expect(wrapper.find('button.toolbar-button').attributes('class')).toContain('has-text')
      expect(wrapper.find('button').text()).toEqual(slotContent)
    })

    it('renders the `primary` appearance', async () => {
      const slotContent = 'This is the button text'

      const wrapper = await mount(ToolbarButton, {
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
      expect(wrapper.find('button.toolbar-button').attributes('class')).toContain('primary')
      expect(wrapper.find('button.toolbar-button').attributes('class')).not.toContain('secondary')
      expect(wrapper.find('button.toolbar-button').attributes('class')).toContain('has-text')
      expect(wrapper.find('button').text()).toEqual(slotContent)
    })
  })
})
