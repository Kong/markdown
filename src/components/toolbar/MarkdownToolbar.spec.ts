// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { ref, h } from 'vue'
import { mount } from '@vue/test-utils'
import MarkdownToolbar from './MarkdownToolbar.vue'
import { MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY } from '@/injection-keys'
import type { MarkdownMode, FormatOption, TemplateOption } from '@/types'

// Provide data to be received in the `setup` function via `inject`
// Defaults are provided
const setProvideData = (
  { mode = 'read', editable = true, fullscreen = false, htmlPreview = false }:
  { mode?: MarkdownMode, editable?: boolean, fullscreen?: boolean, htmlPreview?: boolean },
) => ({
  // Bind the Symbol() as dynamic keys <https://test-utils.vuejs.org/api/#global-provide>
  [MODE_INJECTION_KEY]: ref(mode), // Note: split mode will be automatically switched to edit basd on the viewport
  [EDITABLE_INJECTION_KEY]: ref(editable),
  [FULLSCREEN_INJECTION_KEY]: ref(fullscreen),
  [HTML_PREVIEW_INJECTION_KEY]: ref(htmlPreview),
})

const formatOptions: Partial<FormatOption>[] = [
  { label: 'Bold', action: 'bold', keys: ['B'] },
  { label: 'Italic', action: 'italic', keys: ['I'] },
  { label: 'Underline', action: 'underline', keys: ['U'] },
  { label: 'Strikethrough', action: 'strikethrough', keys: ['Shift', 'X'] },
  { label: 'Code', action: 'code', keys: ['Shift', 'C'] },
]

const templateOptions: Partial<TemplateOption>[] = [
  { label: 'Unordered List', action: 'unordered-list' },
  { label: 'Ordered List', action: 'ordered-list' },
  { label: 'Tasklist', action: 'task' },
  { label: 'Codeblock', action: 'codeblock' },
  { label: 'Table', action: 'table' },
  { label: 'Blockquote', action: 'blockquote' },
]

describe('<MarkdownToolbar />', () => {
  describe('mode switcher', () => {
    // Loop through each mode
    for (const mode of ['read', 'edit', 'split', 'preview']) {
      describe(`${mode}-mode`, () => {

        it(`is ${mode === 'read' ? 'hidden' : 'visible'} in '${mode}' mode`, async () => {
          const wrapper = mount(MarkdownToolbar, {
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
            const wrapper = mount(MarkdownToolbar, {
              global: {
                provide: setProvideData({
                  mode: mode as MarkdownMode,
                  editable: true,
                }),
              },
            })

            // Ensure each mode radio button is visible
            expect(wrapper.findTestId(`${mode}-mode-button`).classes('active')).toBe(true)
            expect(wrapper.findTestId('edit-mode-button').isVisible()).toBe(true)
            expect(wrapper.findTestId('split-mode-button').isVisible()).toBe(true)
            expect(wrapper.findTestId('preview-mode-button').isVisible()).toBe(true)
          })
        }
      })
    }
  })

  describe('toolbar-buttons', () => {
    // Loop through the iterable buttons
    for (const button of [...formatOptions, ...templateOptions]) {
      it(`'${button.label}' button is visible`, async () => {
        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
            }),
          },
        })

        expect(wrapper.find(`[data-testid$="-option-${button.action}"]`).isVisible()).toBe(true)
      })
    }

    // Now test the standalone buttons

    it("'Fullscreen' button is visible", async () => {
      const wrapper = mount(MarkdownToolbar, {
        global: {
          provide: setProvideData({
            mode: 'edit',
            editable: true,
          }),
        },
      })

      expect(wrapper.findTestId('toggle-fullscreen').isVisible()).toBe(true)
    })

    it("'HTML Preview' button is visible", async () => {
      const wrapper = mount(MarkdownToolbar, {
        global: {
          provide: setProvideData({
            mode: 'preview', // must be in preview or split mode
            editable: true,
          }),
        },
      })

      expect(wrapper.findTestId('toggle-html-preview').isVisible()).toBe(true)
    })

    it("'HTML Preview' button is not visible in edit mode", async () => {
      const wrapper = mount(MarkdownToolbar, {
        global: {
          provide: setProvideData({
            mode: 'edit', // must be in preview or split mode
            editable: true,
          }),
        },
      })

      expect(wrapper.findTestId('toggle-html-preview').exists()).toBe(false)
    })
  })

  describe('emit events', () => {
    describe('change-mode', () => {
      it('changes the mode when one of the mode radio buttons is clicked', async () => {
        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('edit-mode-button').classes('active')).toBe(true)
        expect(wrapper.findTestId('split-mode-button').classes('active')).toBe(false)
        expect(wrapper.findTestId('preview-mode-button').classes('active')).toBe(false)

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

    describe('format-selection', () => {
      // Loop through the format options
      for (const option of formatOptions) {
        it(`emits the '${option.action}' payload when the '${option.label}' button is clicked`, async () => {
          const wrapper = mount(MarkdownToolbar, {
            global: {
              provide: setProvideData({
                mode: 'edit',
                editable: true,
              }),
            },
          })

          expect(wrapper.findTestId(`format-option-${option.action}`).isVisible()).toBe(true)

          // Click the button
          await wrapper.findTestId(`format-option-${option.action}`).trigger('click')

          // Ensure the event was emitted
          expect(wrapper.emitted()).toHaveProperty('format-selection')

          // Grab the emitted event
          const clickEvent = wrapper.emitted('format-selection') || []

          expect(clickEvent).toHaveLength(1)
          expect(clickEvent[0]).toEqual([option.action])
        })
      }
    })

    describe('insert-template', () => {
      // Loop through the template options
      for (const option of templateOptions) {
        it(`emits the '${option.action}' payload when the '${option.label}' button is clicked`, async () => {
          const wrapper = mount(MarkdownToolbar, {
            global: {
              provide: setProvideData({
                mode: 'edit',
                editable: true,
              }),
            },
          })

          expect(wrapper.findTestId(`template-option-${option.action}`).isVisible()).toBe(true)

          // Click the button
          await wrapper.findTestId(`template-option-${option.action}`).trigger('click')

          // Ensure the event was emitted
          expect(wrapper.emitted()).toHaveProperty('insert-template')

          // Grab the emitted event
          const clickEvent = wrapper.emitted('insert-template') || []

          expect(clickEvent).toHaveLength(1)
          expect(clickEvent[0]).toEqual([option.action])
        })
      }
    })

    describe('toggle-fullscreen', () => {
      it('toggles fullscreen when the fullscreen button is clicked', async () => {
        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
              fullscreen: false,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('edit-mode-button').classes('active')).toBe(true)

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
        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'preview', // must be in preview or split mode
              editable: true,
              htmlPreview: false,
            }),
          },
        })

        // Ensure the starting mode is active
        expect(wrapper.findTestId('preview-mode-button').classes('active')).toBe(true)

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

  describe('slots', () => {
    // We cannot test the default slot content from this component since it is provided by the parent `MarkdownUi.vue` component
    describe('editor-actions', () => {
      it('displays slot content if provided', async () => {
        const saveButtonText = 'Save changes'
        const cancelButtonText = 'Cancel changes'

        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
            }),
          },
          slots: {
            'editor-actions': [
              h('button', { 'data-testid': 'save' }, saveButtonText),
              h('button', { 'data-testid': 'cancel' }, cancelButtonText),
            ],
          },
        })

        expect(wrapper.findTestId('slot-editor-actions').isVisible()).toBe(true)
        // Slotted Save button
        expect(wrapper.findTestId('save').isVisible()).toBe(true)
        expect(wrapper.findTestId('save').text()).toEqual(saveButtonText)
        // Slotted Cancel button
        expect(wrapper.findTestId('cancel').isVisible()).toBe(true)
        expect(wrapper.findTestId('cancel').text()).toEqual(cancelButtonText)
      })
    })

    describe('toolbar-right', () => {
      it('displays slot content if provided', async () => {
        const buttonText = 'Custom toolbar button'

        const wrapper = mount(MarkdownToolbar, {
          global: {
            provide: setProvideData({
              mode: 'edit',
              editable: true,
            }),
          },
          slots: {
            'toolbar-right': h('button', { 'data-testid': 'custom' }, buttonText),
          },
        })

        expect(wrapper.findTestId('slot-toolbar-right').isVisible()).toBe(true)
        // Slotted button
        expect(wrapper.findTestId('custom').isVisible()).toBe(true)
        expect(wrapper.findTestId('custom').text()).toEqual(buttonText)
      })
    })
  })
})
