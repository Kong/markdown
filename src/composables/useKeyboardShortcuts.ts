import { computed, watch } from 'vue'
import type { Ref } from 'vue'
import useMarkdownActions from './useMarkdownActions'
import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core'
import { logicAnd, logicOr } from '@vueuse/math'

/**
 * Utilize keyboard shortcuts in the markdown editor.
 * @param {string} textareaId The `id` of the textarea
 * @returns
 */
export default function useKeyboardShortcuts(textareaId: string, rawMarkdown: Ref<string>, onEditCallback: () => void) {
  // The document.activeElement
  const activeElement = useActiveElement()
  const textareaIsActive = computed((): boolean => activeElement.value?.id === textareaId)
  const { toggleInlineFormatting } = useMarkdownActions(textareaId, rawMarkdown)

  // Keyboard events
  const keys = useMagicKeys()

  // TODO: Skip debounce
  // TODO: Control messes with text selection
  // TODO: Only enable in EDIT mode
  whenever(logicAnd(logicOr(keys.command_b, keys.control_b), textareaIsActive), () => {
    toggleInlineFormatting('bold')
    onEditCallback()
  })
}
