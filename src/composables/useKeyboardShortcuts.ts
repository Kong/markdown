import { computed } from 'vue'
import type { Ref } from 'vue'
import useMarkdownActions from './useMarkdownActions'
import { useActiveElement, useMagicKeys } from '@vueuse/core'
import { KEYBOARD_SHORTCUTS } from '../constants'
import type { InlineFormat } from '../types'

/**
 * Utilize keyboard shortcuts in the markdown editor. Must be called at the root of the `setup` function.
 * @param {string} textareaId The `id` of the textarea
 * @param {Ref<string>} rawMarkdown A Vue ref containing the raw markdown content from the textarea.
 * @param {Function} onEditCallback A function to call after toggling the inline text formatting.
 * @returns
 */
export default function useKeyboardShortcuts(
  textareaId: string,
  rawMarkdown: Ref<string>,
  onEditCallback: () => void,
) {
  // The document.activeElement
  const activeElement = useActiveElement()
  const textareaIsActive = computed((): boolean => activeElement.value?.id === textareaId)
  const { toggleInlineFormatting } = useMarkdownActions(textareaId, rawMarkdown)

  useMagicKeys({
    passive: false,
    onEventFired(e) {
      // Exit if the textarea is not active or not a `keydown` event
      if (!textareaIsActive.value || e.type !== 'keydown') {
        return
      }

      // Bind keyboard shortcuts
      if (
        // If Control or Meta (Command) is pressed
        (e.ctrlKey || e.metaKey) &&
        // If the other key is in the KEYBOARD_SHORTCUTS dictionary
        Object.keys(KEYBOARD_SHORTCUTS).includes(e.key.toLowerCase())
      ) {
        e.preventDefault()
        toggleInlineFormatting((KEYBOARD_SHORTCUTS[e.key] as InlineFormat))
        onEditCallback()
      }
    },
  })
}
