import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import MarkdownUi from './MarkdownUi.vue'
import { InlineFormatWrapper } from '@/constants'
import { KUI_BREAKPOINT_PHABLET } from '@kong/design-tokens'
import type { Theme } from '@/types'

// Default markdown content
const defaultText = 'Markdown Content'
const defaultContent = `# ${defaultText}`

/**
 * The markdown content takes roughly 400ms to initialize `markdown-it` and render, so await this function in each test immediately after calling `mount()` that is not in `edit` mode.
 * @param wrapper The component wrapper
 * @example await waitForMarkdownRender(wrapper)
 */
const waitForMarkdownRender = async (wrapper: any): Promise<void> => {
  await vi.waitUntil(
    () => wrapper.findTestId('markdown-content').element.innerHTML.length > 0,
    {
      timeout: 1000,
      interval: 20,
    },
  )

  expect(wrapper.findTestId('markdown-content').element.innerHTML.length).toBeGreaterThan(0)
}

/**
 * When text is entered into the editor, the `update:modelValue` event is fired on a debounce. This function waits for the event to be emitted before continuing
 * @param wrapper The component wrapper
 * @param {string} emit The name of the emitted event to wait for
 * @example await waitForEmittedEvent(wrapper, 'update:modelValue')
 */
const waitForEmittedEvent = async (wrapper: any, emit: string): Promise<void> => {
  if (!emit) {
    throw new Error('waitForEmittedEvent: `emit` string param is required')
  }

  await vi.waitFor(async () => {
    expect(wrapper.emitted()).toHaveProperty(emit)
  },
  {
    timeout: 1000,
    interval: 50,
  })
}

// Stub the return value for useMediaQuery to determine if browser is at least phablet width
const mediaQuerySpy = ({
  isPhabletWidth = true,
}: {
  isPhabletWidth?: boolean,
  theme?: Theme,
}) => vi.spyOn(global.window, 'matchMedia').mockImplementation((query: string): MediaQueryList => {
  let matches = false
  if (query.includes(`min-width: ${KUI_BREAKPOINT_PHABLET}`)) {
    matches = isPhabletWidth
  }

  // @ts-ignore
  return {
    matches,
    media: query,
    addListener: () => {}, // Mocking addListener method
    removeListener: () => {}, // Mocking removeListener method
  }
})

describe('<MarkdownUi />', () => {
  beforeEach(() => {
    // Emulate a larger browser
    mediaQuerySpy({})
  })

  describe('modes', () => {
    describe('read', () => {
      it('displays markdown content in read mode', async () => {
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'read',
            editable: false,
            modelValue: defaultContent,
          },
        })

        await waitForMarkdownRender(wrapper)

        expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
        // Ensure markdown is rendered into tags and content
        expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
        // Elements should not exist
        expect(wrapper.findTestId('edit').exists()).toBe(false)
        expect(wrapper.findTestId('toolbar').exists()).toBe(false)
      })

      it('displays the Edit button read mode when `editable` is true', async () => {
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'read',
            editable: true,
            modelValue: defaultContent,
          },
        })

        await waitForMarkdownRender(wrapper)

        // Ensure markdown is rendered into tags and content
        expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
        // Edit button should be visible
        expect(wrapper.findTestId('edit').isVisible()).toBe(true)
        // Elements should not exist
        expect(wrapper.findTestId('toolbar').exists()).toBe(false)
      })
    })

    describe('edit', () => {
      it('does not show edit mode when `editable` prop is false', async () => {
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'edit',
            editable: false,
            modelValue: defaultText,
          },
        })

        await waitForMarkdownRender(wrapper)

        expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').text()).toContain(defaultText)
        // Elements should not exist
        expect(wrapper.findTestId('edit').exists()).toBe(false)
        expect(wrapper.findTestId('toolbar').exists()).toBe(false)
      })

      it('updates the v-model when the editor content is changed', async () => {
        const text = '# Starter content'
        const newText = '# This is the new content'
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'edit',
            editable: true,
            modelValue: text,
            'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
          },
        })

        // No need to wait in edit mode

        expect(wrapper.findTestId('toolbar').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
        // Expect original text
        expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(text)
        // Elements should not exist
        expect(wrapper.findTestId('markdown-content').exists()).toBe(false)
        expect(wrapper.findTestId('edit').exists()).toBe(false)

        // Set the new text
        await wrapper.findTestId('markdown-editor-textarea').setValue(newText)

        await flushPromises()

        const eventName = 'update:modelValue'

        // Verify event is emitted
        await waitForEmittedEvent(wrapper, eventName)

        // Verify the emitted event
        expect(wrapper.emitted(eventName) || []).toHaveLength(1)
        expect(wrapper.emitted(eventName)![0]).toEqual([newText])

        // Expect new text
        expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(newText)
      })
    })

    describe('split', () => {
      it('displays both the editor and preview panes with correct content', async () => {
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'split',
            editable: true,
            modelValue: defaultContent,
          },
        })

        await waitForMarkdownRender(wrapper)

        expect(wrapper.findTestId('toolbar').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
        // Expect text
        expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(defaultContent)
        // Ensure markdown is rendered into tags and content
        expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
        // Elements should not exist
        expect(wrapper.findTestId('edit').exists()).toBe(false)
      })
    })

    describe('preview', () => {
      it('displays only the preview pane correct content', async () => {
        const wrapper = mount(MarkdownUi, {
          props: {
            mode: 'preview',
            editable: true,
            modelValue: defaultContent,
          },
        })

        await waitForMarkdownRender(wrapper)

        expect(wrapper.findTestId('toolbar').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
        // Ensure markdown is rendered into tags and content
        expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
        expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
        // Elements should not exist
        expect(wrapper.findTestId('markdown-editor-textarea').exists()).toBe(false)
        expect(wrapper.findTestId('edit').exists()).toBe(false)
      })
    })
  })

  describe('actions', () => {
    it('copies code block text to the clipboard via the copy button', async () => {
      const copiedText = ref('')
      // Stub the navigator.clipboard.writeText method
      window.navigator = {
        // @ts-ignore
        clipboard: {
          writeText: vi.fn(async (text: string) => {
            copiedText.value = text
          }),
        },
      }

      const codeContent = "const name: string = 'Marty McFly'"
      const wrapper = mount(MarkdownUi, {
        props: {
          mode: 'read',
          editable: false,
          modelValue: '```typescript\n' + codeContent + '\n```',
        },
      })

      await waitForMarkdownRender(wrapper)

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').text()).toContain(codeContent)
      // Copy button should be visible
      expect(wrapper.findTestId('copy-code-button').isVisible()).toBe(true)
      // Ensure the copy text is empty before clicking the copy button
      expect(copiedText.value).toEqual('')

      await wrapper.findTestId('copy-code-button').trigger('click')

      // Verify the text was copied
      expect(copiedText.value).toEqual(codeContent)
    })

    it('can change modes via all action buttons when editing is enabled', async () => {
      const wrapper = mount(MarkdownUi, {
        props: {
          mode: 'read',
          editable: true,
          modelValue: defaultContent,
        },
      })

      await waitForMarkdownRender(wrapper)

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      // Ensure markdown is rendered into tags and content
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
      // Elements should not exist
      expect(wrapper.findTestId('toolbar').exists()).toBe(false)
      expect(wrapper.findTestId('markdown-editor-textarea').exists()).toBe(false)
      expect(wrapper.findTestId('save').exists()).toBe(false)
      expect(wrapper.findTestId('cancel').exists()).toBe(false)
      // Edit button should exist in read mode
      expect(wrapper.findTestId('edit').isVisible()).toBe(true)

      // Click the Edit button
      await wrapper.findTestId('edit').trigger('click')

      // Mode event should be emitted
      expect(wrapper.emitted()).toHaveProperty('mode')

      // Verify the emitted event
      expect(wrapper.emitted('mode') || []).toHaveLength(1)
      expect(wrapper.emitted('mode')![0]).toEqual(['split'])

      // Both panes should be visible
      expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
      expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(defaultContent)

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)

      // Toolbar should now be visible
      expect(wrapper.findTestId('toolbar').exists()).toBe(true)
      expect(wrapper.findTestId('save').isVisible()).toBe(true)
      expect(wrapper.findTestId('cancel').isVisible()).toBe(true)

      // We should now be in split mode since on a larger screen
      expect(wrapper.findTestId('split-mode-button').isVisible()).toBe(true)
      expect(wrapper.findTestId('split-mode-button').classes('active')).toBe(true)
      // Ensure the other mode buttons are also visible
      expect(wrapper.findTestId('edit-mode-button').isVisible()).toBe(true)
      expect(wrapper.findTestId('preview-mode-button').isVisible()).toBe(true)

      // Click the Edit mode button
      await wrapper.findTestId('edit-mode-button').trigger('click')

      // Mode event should be emitted again
      expect(wrapper.emitted('mode') || []).toHaveLength(2)
      expect(wrapper.emitted('mode')![1]).toEqual(['edit'])

      expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
      // Expect original text
      expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(defaultContent)
      // Elements should not exist
      expect(wrapper.findTestId('markdown-content').exists()).toBe(false)
      expect(wrapper.findTestId('edit').exists()).toBe(false)

      // Click the Preview mode button
      await wrapper.findTestId('preview-mode-button').trigger('click')

      // Mode event should be emitted again
      expect(wrapper.emitted('mode') || []).toHaveLength(3)
      expect(wrapper.emitted('mode')![2]).toEqual(['preview'])

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
      // Textarea should not exist
      expect(wrapper.findTestId('markdown-editor-textarea').exists()).toBe(false)

      // Click the Save button
      await wrapper.findTestId('save').trigger('click')

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      // Ensure markdown is rendered into tags and content
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)
      // Elements should not exist
      expect(wrapper.findTestId('toolbar').exists()).toBe(false)
      expect(wrapper.findTestId('markdown-editor-textarea').exists()).toBe(false)
      expect(wrapper.findTestId('save').exists()).toBe(false)
      expect(wrapper.findTestId('cancel').exists()).toBe(false)
      // Edit button should exist in read mode
      expect(wrapper.findTestId('edit').isVisible()).toBe(true)
    })

    it('toggles fullscreen when the fullscreen button is clicked', async () => {
      const wrapper = mount(MarkdownUi, {
        props: {
          mode: 'split',
          editable: true,
          modelValue: defaultContent,
        },
      })

      await waitForMarkdownRender(wrapper)

      // Ensure the wrapper class does not exist
      expect(wrapper.findTestId('markdown-ui').classes('fullscreen')).toBe(false)

      // Both panes should be visible
      expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
      expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(defaultContent)

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)

      // Ensure the starting mode is active
      expect(wrapper.findTestId('split-mode-button').classes('active')).toBe(true)

      expect(wrapper.findTestId('toggle-fullscreen').isVisible()).toBe(true)

      // Click the Fullscreen button
      await wrapper.findTestId('toggle-fullscreen').trigger('click')

      // Ensure the event was emitted
      expect(wrapper.emitted()).toHaveProperty('fullscreen')
      expect(wrapper.emitted('fullscreen') || []).toHaveLength(1)
      expect(wrapper.emitted('fullscreen')![0]).toEqual([true])

      // Ensure the wrapper class is added
      expect(wrapper.findTestId('markdown-ui').classes('fullscreen')).toBe(true)
    })

    it('toggles the html preview when the html preview button is clicked', async () => {
      const wrapper = mount(MarkdownUi, {
        props: {
          mode: 'split',
          editable: true,
          modelValue: defaultContent,
        },
      })

      await waitForMarkdownRender(wrapper)

      // Ensure the wrapper class does not exist
      expect(wrapper.findTestId('markdown-content').classes('html-preview')).toBe(false)
      // Ensure the HTML preview does not exist
      expect(wrapper.find('pre > code.language-html').exists()).toBe(false)
      expect(wrapper.findTestId('copy-code-button').exists()).toBe(false)

      // Both panes should be visible
      expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
      expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(defaultContent)

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').find('h1').text()).toEqual(defaultText)

      // Ensure the starting mode is active
      expect(wrapper.findTestId('split-mode-button').classes('active')).toBe(true)

      expect(wrapper.findTestId('toggle-html-preview').isVisible()).toBe(true)

      // Click the Fullscreen button
      await wrapper.findTestId('toggle-html-preview').trigger('click')

      // Ensure the wrapper class is added
      expect(wrapper.findTestId('markdown-content').classes('html-preview')).toBe(true)

      expect(wrapper.find('pre > code.language-html').isVisible()).toBe(true)
      expect(wrapper.findTestId('copy-code-button').isVisible()).toBe(true)
    })

    describe('format buttons', () => {
      // Loop through enabled format buttons
      for (const format of Object.keys(InlineFormatWrapper)) {
        // Skip the format options that are not currently enabled
        if (['subscript', 'superscript', 'mark'].includes(format)) {
          continue
        }
        it(`formats text as ${format}`, async () => {
          const textStart = 'This is a sentence that needs '
          const textMiddle = `${format} text`
          const textEnd = ' in the middle.'
          const sentence = textStart + textMiddle + textEnd

          const wrapper = mount(MarkdownUi, {
            props: {
              mode: 'split',
              editable: true,
              modelValue: sentence,
            },
          })

          await waitForMarkdownRender(wrapper)

          expect(wrapper.findTestId('toolbar').isVisible()).toBe(true)
          expect(wrapper.findTestId('markdown-editor-textarea').isVisible()).toBe(true)
          expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
          // Expect text
          expect(wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.value).toEqual(sentence)
          // Ensure markdown is rendered into tags and content
          expect(wrapper.findTestId('markdown-content').find('p').isVisible()).toBe(true)
          expect(wrapper.findTestId('markdown-content').find('p').text()).toEqual(sentence)

          await wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.focus()
          // Start the text selection after the start text
          wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.selectionStart = textStart.length
          // End the text selection after the middle text
          wrapper.findTestId<'textarea'>('markdown-editor-textarea').element.selectionEnd = textStart.length + textMiddle.length

          // Click the formatting button
          await wrapper.findTestId(`format-option-${format}`).trigger('click')

          // Verify event is emitted
          const eventName = 'update:modelValue'
          await waitForEmittedEvent(wrapper, eventName)

          expect(wrapper.emitted(eventName) || []).toHaveLength(1)
          // @ts-ignore - referencing enum properties
          expect(wrapper.emitted(eventName)![0]).toEqual([`${textStart}${InlineFormatWrapper[format]}${textMiddle}${InlineFormatWrapper[format]}${textEnd}`])
        })
      }
    })
  })
})
