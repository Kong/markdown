import { reactive, nextTick } from 'vue'
import type { Ref } from 'vue'
import { InlineFormatWrapper, DEFAULT_CODEBLOCK_LANGUAGE } from '../constants'
import type { InlineFormat, MarkdownTemplate } from '../types'

/**
 * Utilize the markdown editor actions.
 * @param {string} textareaId The `id` of the textarea
 * @returns
 */
export default function useMarkdownActions(textareaId: string, rawMarkdown: Ref<string>) {
  // A reactive object to keep track of the textarea's selection
  const selectedText = reactive({
    start: 0,
    end: 0,
    text: '',
  })

  /** Utilize the textareaId to obtain a reference to the underlying textarea element */
  const getTextarea = (): HTMLTextAreaElement | null => {
    // Find the textarea within the component container
    const selector = `#${textareaId}`
    const textarea: HTMLTextAreaElement | null = document.querySelector(selector)

    if (!textarea) {
      throw new Error(`Could not find '${selector}'`)
    }

    return textarea
  }

  /** Get the selection within the textarea */
  const getSelectedText = (): void => {
    try {
      const textarea = getTextarea()

      if (!textarea) {
        return
      }

      selectedText.start = textarea.selectionStart || 0
      selectedText.end = textarea.selectionEnd || 0
      selectedText.text = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd,
      ) || ''
    } catch (err) {
      console.warn('getSelectedText', err)
      selectedText.start = 0
      selectedText.end = 0
      selectedText.text = ''
    }
  }

  /**
   * Toggle inline formatting within the textarea. Can be used with and without an active selection.
   * @param {InlineFormat} format The inline format being added/removed, e.g. 'bold'
   * @returns {Promise<void>}
   */
  const toggleInlineFormatting = async (format: InlineFormat): Promise<void> => {
    try {
      const textarea = getTextarea()

      let wrapper: string = ''

      switch (format) {
        case 'bold':
          wrapper = InlineFormatWrapper.Bold
          break
        case 'italic':
          wrapper = InlineFormatWrapper.Italic
          break
        case 'underline':
          wrapper = InlineFormatWrapper.Underline
          break
        case 'strikethrough':
          wrapper = InlineFormatWrapper.Strikethrough
          break
        case 'subscript':
          wrapper = InlineFormatWrapper.Subscript
          break
        case 'superscript':
          wrapper = InlineFormatWrapper.Superscript
          break
        case 'mark':
          wrapper = InlineFormatWrapper.Mark
          break
        case 'code':
          wrapper = InlineFormatWrapper.Code
          break
      }

      // If no element or wrapper, exit early
      if (!textarea || !wrapper || document.activeElement !== textarea) {
        return
      }

      // Update the selected text object
      getSelectedText()

      // Store the length of the `wrapper`
      const wrapperLength = wrapper.length

      // Get the text before and after the cursor
      const beforeText = rawMarkdown.value.substring(0, selectedText.start)
      const afterText = rawMarkdown.value.substring(selectedText.end)

      // If no text is selected, insert the `wrapper` on both sides of the cursor
      if (selectedText.text.length === 0) {
        // If the `wrapper` text is to the left and right of the cursor
        if (beforeText.endsWith(wrapper) && afterText.startsWith(wrapper)) {
          // Remove the empty wrapper
          rawMarkdown.value = beforeText.substring(0, beforeText.length - wrapperLength) + afterText.substring(wrapperLength)

          await nextTick()
          // Always focus back on the textarea
          textarea.focus()

          textarea.selectionEnd = selectedText.start - wrapperLength

          return
        } else {
          // If the `wrapper` text does not exist to the left and right of the cursor
          rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start) + wrapper + wrapper + rawMarkdown.value.substring(selectedText.end)

          await nextTick()
          // Always focus back on the textarea
          textarea.focus()

          // Move the cursor between the `wrapper`
          textarea.selectionEnd = selectedText.start + wrapperLength

          return
        }
      }

      let isWrapped = false
      const wrapSelected = selectedText.text.startsWith(wrapper) && selectedText.text.endsWith(wrapper)
      const wrapNotSelected = beforeText.endsWith(wrapper) && afterText.startsWith(wrapper)

      // Check if the selected text is already wrapped with the `wrapper`
      if (wrapSelected || wrapNotSelected) {
        isWrapped = true
      }

      let newText = selectedText.text

      if (!isWrapped) {
        // Selection is not wrapped
        newText = wrapper + selectedText.text + wrapper
      } else if (isWrapped && wrapSelected) {
        // Selection is wrapped and the wrapper is inside the selection
        newText = selectedText.text.slice(wrapperLength, -wrapperLength)
      } else if (isWrapped && wrapNotSelected) {
        // Selection is wrapped and the wrapper is outside the selection
        // No changes needed
      }

      // Replace the selected text with the formatted text
      if (isWrapped && wrapNotSelected) {
        rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start - wrapperLength) + newText + rawMarkdown.value.substring(selectedText.end + wrapperLength)
      } else {
        rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start) + newText + rawMarkdown.value.substring(selectedText.end)
      }

      await nextTick()
      // Always focus back on the textarea
      textarea.focus()

      // Adjust the selection position
      if (!isWrapped) {
        // Selection is not wrapped
        textarea.setSelectionRange(selectedText.start, selectedText.end + (wrapperLength * 2))
      } else if (isWrapped && wrapSelected) {
        // Selection is wrapped and the wrapper is inside the selection
        textarea.setSelectionRange(selectedText.start, selectedText.end - (wrapperLength * 2))
      } else if (isWrapped && wrapNotSelected) {
        // Selection is wrapped and the wrapper is outside the selection
        textarea.setSelectionRange(selectedText.start - wrapperLength, selectedText.end - wrapperLength)
      }
    } catch (err) {
      console.warn('toggleInlineFormatting', err)
    }
  }

  /**
   * Toggle a tab in the editor at the current cursor position, or for all selected lines.
   * @param {'add' | 'remove'} action The action being taken in the textarea. One of 'add' or 'remove'.
   * @param {number} tabSize The value of props.tabSize
   * @returns {Promise<void>}
   */
  const toggleTab = async (action: 'add' | 'remove', tabSize: number): Promise<void> => {
    try {
      const textarea = getTextarea()

      if (!textarea) {
        return
      }

      // Update the selected text object
      getSelectedText()

      let spaces = ''
      Array.from(Array(tabSize).keys()).forEach(() => (spaces += ' '))
      let lineBreakCount = 0

      // When removing tabs, ensure string starts with two spaces; if not, exit
      if (action === 'remove' && !rawMarkdown.value.substring(0, selectedText.start).endsWith(spaces)) {
        return
      }

      if (selectedText.text.length !== 0) {
        // Count number of line breaks in selection. Only include a single `\n` or the last of `\n\n`
        lineBreakCount = (selectedText.text.match(/\n(?!\n)/g) || []).length
        // If text is selected
        if (action === 'add') {
          rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start) + spaces + selectedText.text.replace(/\n(?!\n)/g, `\n${spaces}`) + rawMarkdown.value.substring(selectedText.end)
        } else {
          rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start - spaces.length) + selectedText.text.replaceAll(`\n${spaces}`, '\n') + rawMarkdown.value.substring(selectedText.end)
        }
      } else {
        // If text is not selected
        rawMarkdown.value = action === 'add' ? rawMarkdown.value.substring(0, selectedText.start) + spaces + rawMarkdown.value.substring(selectedText.end) : rawMarkdown.value.substring(0, selectedText.start - spaces.length) + rawMarkdown.value.substring(selectedText.end)
      }

      await nextTick()
      // Always focus back on the textarea
      textarea.focus()

      // Move the cursor and selected text
      if (selectedText.text.length !== 0) {
        // Calculate length of selection from line breaks that were replaces
        const appendedSpacesLength = tabSize + (lineBreakCount * tabSize)
        // Move the cursor to keep the selected text in the selection
        textarea.selectionStart = action === 'add' ? selectedText.start + spaces.length : selectedText.start - spaces.length
        textarea.selectionEnd = action === 'add' ? selectedText.end + appendedSpacesLength : selectedText.end - appendedSpacesLength
      } else {
        // Move the cursor to the start of the tabbed text
        textarea.selectionEnd = action === 'add' ? selectedText.start + spaces.length : selectedText.start - spaces.length
      }
    } catch (err) {
      console.warn('toggleTab', err)
    }
  }

  /**
   * Insert a markdown template at the current cursor position.
   * @param {MarkdownTemplate} template The type of markdown template to insert at the current cursor position.
   * @returns {Promise<void>}
   */
  const insertMarkdownTemplate = async (template: MarkdownTemplate): Promise<void> => {
    try {
      const textarea = getTextarea()

      if (!textarea || !template) {
        return
      }

      // Update the selected text object
      getSelectedText()

      if (selectedText.text.length !== 0) {
        return
      }

      let markdownTemplate: string = ''

      switch (template) {
        case 'codeblock':
          markdownTemplate =
          '```' + DEFAULT_CODEBLOCK_LANGUAGE + '\n' +
          '\n' +
          '```'
          break
        case 'table':
          markdownTemplate =
          '| Column1 | Column2 | Column3 |\n' +
          '| :--- | :--- | :--- |\n' +
          '| Content | Content | Content |'
          break
        case 'task':
          markdownTemplate =
          '- [ ] '
          break
      }

      // If no template was found, exit
      if (!markdownTemplate) {
        return
      }

      rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start) + markdownTemplate + rawMarkdown.value.substring(selectedText.end)

      await nextTick()
      // Always focus back on the textarea
      textarea.focus()

      switch (template) {
        case 'codeblock':
          // Move the cursor to the language string of the codeblock
          textarea.selectionStart = selectedText.start + 3
          // Move the end of the selection to the end of the default language so it is selected
          textarea.selectionEnd = selectedText.start + 3 + DEFAULT_CODEBLOCK_LANGUAGE.length
          break
        default:
          // Move the cursor to the end of the table markdown
          textarea.selectionEnd = selectedText.start + markdownTemplate.length
          break
      }
    } catch (err) {
      console.warn('insertTable', err)
    }
  }

  return {
    selectedText,
    toggleInlineFormatting,
    toggleTab,
    insertMarkdownTemplate,
  }
}
