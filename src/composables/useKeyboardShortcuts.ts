import { computed } from 'vue'
import type { Ref } from 'vue'
import useMarkdownActions from '@/composables/useMarkdownActions'
import { useActiveElement, useMagicKeys } from '@vueuse/core'
import type { InlineFormat } from '@/types'

/**
 * Utilize keyboard shortcuts in the markdown editor. Must be called at the root of the `setup` function.
 * @param {string} textareaId The `id` of the textarea
 * @param {Ref<string>} rawMarkdown A Vue ref containing the raw markdown content from the textarea.
 * @param {Ref<number>} tabSize The current tab size
 * @param {Function} onEditCallback A function to call after toggling the inline text formatting.
 * @returns
 */
export default function useKeyboardShortcuts(
  textareaId: string,
  rawMarkdown: Ref<string>,
  tabSize: Ref<number>,
  onEditCallback: () => void,
) {
  // The document.activeElement
  const activeElement = useActiveElement()
  const textareaIsActive = computed((): boolean => activeElement.value?.id === textareaId)
  const { toggleInlineFormatting, insertNewLine, getTextSelection, selectedText, toggleTab } = useMarkdownActions(textareaId, rawMarkdown)

  const getFormatForKeyEvent = (evt: any): InlineFormat | undefined => {
    let format: InlineFormat | undefined

    // Find mapped keys
    switch (evt.key) {
      // Bold
      case 'b':
        format = 'bold'
        break
      // Italic
      case 'i':
        format = 'italic'
        break
      // Underline
      case 'u':
        format = 'underline'
        break
      // Strikethrough (also requires shift modifier)
      case 'x':
        if (evt.shiftKey) {
          format = 'strikethrough'
        }
        break
      // Inline code (also requires shift modifier)
      case 'c':
        if (evt.shiftKey) {
          format = 'code'
        }
        break
    }

    return format
  }

  // Bind keyboard events
  useMagicKeys({
    passive: false,
    onEventFired(e) {
      // Exit if the textarea is not active or not a `keydown` event
      if (!textareaIsActive.value || e.type !== 'keydown') {
        return
      }

      // If Control or Meta (Command) is pressed
      if (e.key && (e.ctrlKey || e.metaKey)) {
        const format = getFormatForKeyEvent(e)
        // If the format is set, toggle the formatting
        if (format) {
          e.preventDefault()
          toggleInlineFormatting(format)
          // Always fire the callback
          onEditCallback()
        }
      }

      // Enter key
      if (e.key && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        insertNewLine()
        // Always fire the callback
        onEditCallback()
      }

      // Tab key, and Shift + Tab
      if (e.key && e.key === 'Tab') {
        getTextSelection()

        if (selectedText.text) {
          e.preventDefault()
          if (e.shiftKey) {
            toggleTab('remove', tabSize.value)
          } else {
            toggleTab('add', tabSize.value)
          }
          // Always fire the callback
          onEditCallback()
        }
      }
    },
  })
}
