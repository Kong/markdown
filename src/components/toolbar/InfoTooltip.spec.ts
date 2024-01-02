// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import InfoTooltip from './InfoTooltip.vue'

describe('<InfoTooltip />', () => {
  it('renders the default slot content when no tooltip exists', async () => {
    const slotContent = 'This is the button text'

    const wrapper = await mount(InfoTooltip, {
      slots: {
        default: () => h('button', {}, slotContent),
      },
    })

    expect(wrapper.find('button').isVisible()).toBe(true)
    expect(wrapper.find('button').text()).toEqual(slotContent)

    // Hover button
    await wrapper.find('button').trigger('mouseover')

    // Tooltip should not exist
    expect(wrapper.find('.tooltip-content').exists()).toBe(false)
  })

  describe('props', () => {
    it('renders the default slot content when the text prop is provided', async () => {
      const slotContent = 'This is the button text'
      const tooltip = 'This is the tooltip text'

      const wrapper = await mount(InfoTooltip, {
        props: {
          text: tooltip,
        },
        slots: {
          default: () => h('button', {}, slotContent),
        },
      })

      expect(wrapper.find('button').isVisible()).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)

      // Tooltip should exist, even though not hovered
      expect(wrapper.find('.tooltip-content').exists()).toBe(true)
    })

    it('shows the tooltip when the text prop is provided when hovered', async () => {
      const slotContent = 'This is the button text'
      const tooltip = 'This is the tooltip text'

      const wrapper = await mount(InfoTooltip, {
        props: {
          text: tooltip,
        },
        slots: {
          default: () => h('button', {}, slotContent),
        },
      })

      expect(wrapper.find('button').isVisible()).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)

      // Hover button
      await wrapper.find('button').trigger('mouseover')

      expect(wrapper.find('.tooltip-content').isVisible()).toBe(true)
      expect(wrapper.find('.tooltip-content').text()).toEqual(tooltip)
    })
  })

  describe('slots', () => {
    it('renders the default slot content when the tooltip slot is provided', async () => {
      const slotContent = 'This is the button text'
      const tooltip = 'This is the tooltip text'

      const wrapper = await mount(InfoTooltip, {
        slots: {
          default: () => h('button', {}, slotContent),
          tooltip: () => h('div', {}, tooltip),
        },
      })

      expect(wrapper.find('button').isVisible()).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)

      // Tooltip should exist, even though not hovered
      expect(wrapper.find('.tooltip-content').exists()).toBe(true)
    })

    it('shows the tooltip when the text prop is provided when hovered', async () => {
      const slotContent = 'This is the button text'
      const tooltip = 'This is the tooltip text'

      const wrapper = await mount(InfoTooltip, {
        slots: {
          default: () => h('button', {}, slotContent),
          tooltip: () => h('div', {}, tooltip),
        },
      })

      expect(wrapper.find('button').isVisible()).toBe(true)
      expect(wrapper.find('button').text()).toEqual(slotContent)

      // Hover button
      await wrapper.find('button').trigger('mouseover')

      expect(wrapper.find('.tooltip-content').isVisible()).toBe(true)
      expect(wrapper.find('.tooltip-content').text()).toEqual(tooltip)
    })
  })
})
