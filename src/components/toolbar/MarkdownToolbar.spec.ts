// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import MarkdownToolbar from './MarkdownToolbar.vue'
import { MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY } from '@/injection-keys'
import type { MarkdownMode } from '@/types'

// Provide data to be received in the `setup` function via `inject`
// Defaults are provided
const setProvideData = (
  { mode = 'read', editable = true, fullscreen = false, htmlPreview = false }:
  { mode?: MarkdownMode, editable?: boolean, fullscreen?: boolean, htmlPreview?: boolean },
) => ({
  // Bind the Symbol() as dynamic keys <https://test-utils.vuejs.org/api/#global-provide>
  [MODE_INJECTION_KEY]: ref(mode),
  [EDITABLE_INJECTION_KEY]: ref(editable),
  [FULLSCREEN_INJECTION_KEY]: ref(fullscreen),
  [HTML_PREVIEW_INJECTION_KEY]: ref(htmlPreview),
})

describe('<MarkdownToolbar />', () => {
  describe('visibility', () => {
    // Loop through each mode
    for (const mode of ['read', 'edit', 'split', 'preview']) {
      describe(`${mode}-mode`, () => {

        it(`is ${mode === 'read' ? 'hidden' : 'visible'} in '${mode}' mode`, async () => {
          const wrapper = await mount(MarkdownToolbar, {
            global: {
              provide: setProvideData({
                mode: mode as MarkdownMode,
              }),
            },
          })

          expect(wrapper.find('.markdown-ui-toolbar').exists()).toBe(mode !== 'read')
        })

        // Tests when not in `read` mode
        if (mode !== 'read') {
          it('displays the mode selection buttons', async () => {
            const wrapper = await mount(MarkdownToolbar, {
              global: {
                provide: setProvideData({
                  mode: mode as MarkdownMode,
                  editable: true,
                }),
              },
            })

            // Ensure each mode radio button is visible
            expect(wrapper.findTestId(`${mode}-mode-button`).attributes('class')).toContain('active')
            expect(wrapper.findTestId('edit-mode-button').isVisible()).toBe(true)
            expect(wrapper.findTestId('split-mode-button').isVisible()).toBe(true)
            expect(wrapper.findTestId('preview-mode-button').isVisible()).toBe(true)
          })
        }
      })
    }
  })

  describe('emit events', () => {
    describe('change-mode', () => {
      it('changes the mode when one of the mode radio buttons is clicked', async () => {
        const wrapper = await mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('edit-mode-button').attributes('class')).toContain('active')

        expect(wrapper.findTestId('split-mode-button').isVisible()).toBe(true)

        // Click the Split mode button
        await wrapper.findTestId('split-mode-button').trigger('click')

        // Ensure the event was emitted
        expect(wrapper.emitted()).toHaveProperty('change-mode')

        // Grab the emitted event
        const clickEvent = wrapper.emitted('change-mode') || []

        expect(clickEvent).toHaveLength(1)
        expect(clickEvent[0]).toEqual(['split'])
      })
    })

    describe('toggle-fullscreen', () => {
      it('toggles fullscreen when the fullscreen button is clicked', async () => {
        const wrapper = await mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
              fullscreen: false,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('edit-mode-button').attributes('class')).toContain('active')

        expect(wrapper.findTestId('toggle-fullscreen').isVisible()).toBe(true)

        // Click the Fullscreen button
        await wrapper.findTestId('toggle-fullscreen').trigger('click')

        // Ensure the event was emitted
        expect(wrapper.emitted()).toHaveProperty('toggle-fullscreen')

        // Grab the emitted event
        const clickEvent = wrapper.emitted('toggle-fullscreen') || []

        expect(clickEvent).toHaveLength(1)
        // We don't check the value here because the toolbar emits an event with no payload
      })
    })

    describe('toggle-html-preview', () => {
      it('toggles the html preview when the html preview button is clicked', async () => {
        const wrapper = await mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'preview',
              editable: true,
              htmlPreview: false,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('preview-mode-button').attributes('class')).toContain('active')

        expect(wrapper.findTestId('toggle-html-preview').isVisible()).toBe(true)

        // Click the Fullscreen button
        await wrapper.findTestId('toggle-html-preview').trigger('click')

        // Ensure the event was emitted
        expect(wrapper.emitted()).toHaveProperty('toggle-html-preview')

        // Grab the emitted event
        const clickEvent = wrapper.emitted('toggle-html-preview') || []

        expect(clickEvent).toHaveLength(1)
        // We don't check the value here because the toolbar emits an event with no payload
      })
    })
  })
})
