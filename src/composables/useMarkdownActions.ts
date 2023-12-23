import { reactive, nextTick } from 'vue'
import type { Ref } from 'vue'
import { InlineFormatWrapper, DEFAULT_CODEBLOCK_LANGUAGE, MARKDOWN_TEMPLATE_CODEBLOCK, MARKDOWN_TEMPLATE_TASK, MARKDOWN_TEMPLATE_UL, MARKDOWN_TEMPLATE_OL, MARKDOWN_TEMPLATE_BLOCKQUOTE, MARKDOWN_TEMPLATE_TABLE, NEW_LINE_CHARACTER } from '@/constants'
import type { InlineFormat, MarkdownTemplate } from '@/types'

/**
 * Utilize the markdown editor actions.
 * @param {string} textareaId The `id` of the textarea
 * @param {Ref<string>} rawMarkdown A Vue ref containing the raw markdown content from the textarea.
 */
export default function useMarkdownActions(
  textareaId: string,
  rawMarkdown: Ref<string>,
) {
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
  const getTextSelection = (): void => {
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
      console.warn('getTextSelection', err)
      selectedText.start = 0
      selectedText.end = 0
      selectedText.text = ''
    }
  }

  /** Focus on the textarea and wait a virtual DOM cycle */
  const focusTextarea = async (): Promise<void> => {
    const textarea = getTextarea()

    // If no element, exit early
    if (!textarea) {
      return
    }

    // Always focus back on the textarea
    textarea.focus()
    // Wait for the DOM to cycle
    await nextTick()
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
      if (!textarea || !wrapper) {
        return
      }

      // Update the selected text object
      getTextSelection()

      // Store the length of the `wrapper`
      const wrapperLength = wrapper.length

      // Get the text before and after the cursor
      const startText = rawMarkdown.value.substring(0, selectedText.start)
      const endText = rawMarkdown.value.substring(selectedText.end)

      // If no text is selected, insert the `wrapper` on both sides of the cursor
      if (selectedText.text.length === 0) {
        // If the `wrapper` text is to the left and right of the cursor
        if (startText.endsWith(wrapper) && endText.startsWith(wrapper)) {
          // Remove the empty wrapper
          rawMarkdown.value = startText.substring(0, startText.length - wrapperLength) + endText.substring(wrapperLength)

          // Always focus back on the textarea
          await focusTextarea()

          textarea.selectionEnd = selectedText.start - wrapperLength

          return
        } else {
          // If the `wrapper` text does not exist to the left and right of the cursor
          rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start) + wrapper + wrapper + rawMarkdown.value.substring(selectedText.end)

          // Always focus back on the textarea
          await focusTextarea()

          // Move the cursor between the `wrapper`
          textarea.selectionEnd = selectedText.start + wrapperLength

          return
        }
      }

      let isWrapped = false
      const wrapSelected = selectedText.text.startsWith(wrapper) && selectedText.text.endsWith(wrapper)
      const wrapNotSelected = startText.endsWith(wrapper) && endText.startsWith(wrapper)

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

      // Always focus back on the textarea
      await focusTextarea()

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
      getTextSelection()

      let spaces = ''
      Array.from(Array(tabSize).keys()).forEach(() => (spaces += ' '))
      let lineBreakCount = 0

      const startText = rawMarkdown.value.substring(0, selectedText.start)

      // When removing tabs, ensure string starts with two spaces; or a list item that is already indented. If not, exit
      if (
        action === 'remove' &&
        !startText.endsWith(spaces) &&
        // Not an unordered list
        !startText.endsWith('  ' + MARKDOWN_TEMPLATE_UL) &&
        // Not an ordered list
        !/ {2}\d{1,}\. $/.test(startText)
      ) {
        return
      }

      if (selectedText.text.length !== 0) {
        // Count number of line breaks in selection. Only include a single `\n` or the last of `\n\n`
        lineBreakCount = (selectedText.text.match(/\n(?!\n)/g) || []).length
        // If text is selected
        if (action === 'add') {
          rawMarkdown.value = startText + spaces + selectedText.text.replace(/\n(?!\n)/g, `${NEW_LINE_CHARACTER}${spaces}`) + rawMarkdown.value.substring(selectedText.end)
        } else {
          rawMarkdown.value = rawMarkdown.value.substring(0, selectedText.start - spaces.length) + selectedText.text.replaceAll(`${NEW_LINE_CHARACTER}${spaces}`, NEW_LINE_CHARACTER) + rawMarkdown.value.substring(selectedText.end)
        }
      } else {
        // If text is not selected

        // If text starts with an inline template
        if (startText.endsWith(MARKDOWN_TEMPLATE_UL)) {
          rawMarkdown.value = action === 'add' ? rawMarkdown.value.substring(0, selectedText.start - MARKDOWN_TEMPLATE_UL.length) + spaces + MARKDOWN_TEMPLATE_UL + rawMarkdown.value.substring(selectedText.end) : rawMarkdown.value.substring(0, selectedText.start - spaces.length - MARKDOWN_TEMPLATE_UL.length) + MARKDOWN_TEMPLATE_UL + rawMarkdown.value.substring(selectedText.end)
        } else if (/\d{1,}\. $/.test(startText.split(NEW_LINE_CHARACTER).pop() || '')) {
          // Remove the `1` in the ordered list template
          const numberSuffix = MARKDOWN_TEMPLATE_OL.replace('1', '')

          const listNumber = Number((startText.split(NEW_LINE_CHARACTER).at(-2) || startText.split(NEW_LINE_CHARACTER).pop() || '').trimStart().split(numberSuffix)[0]) + 1
          console.log('listNumber', listNumber)

          rawMarkdown.value = action === 'add' ? rawMarkdown.value.substring(0, selectedText.start - MARKDOWN_TEMPLATE_OL.length) + spaces + MARKDOWN_TEMPLATE_OL + rawMarkdown.value.substring(selectedText.end) : rawMarkdown.value.substring(0, selectedText.start - spaces.length - (listNumber + numberSuffix).length) + (listNumber + numberSuffix) + rawMarkdown.value.substring(selectedText.end)
        } else {
          rawMarkdown.value = action === 'add' ? startText + spaces + rawMarkdown.value.substring(selectedText.end) : rawMarkdown.value.substring(0, selectedText.start - spaces.length) + rawMarkdown.value.substring(selectedText.end)
        }
      }

      // Always focus back on the textarea
      await focusTextarea()

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

  /** Check if the single line template already exists on the line */
  const singleLineTemplateExists = (startText: string, template: string) => {
    // Special handling for ordered list items
    if (template === MARKDOWN_TEMPLATE_OL) {
      // If the startText begins with `{number}. `
      return /^\d{1,}\. /.test(String(startText?.split(NEW_LINE_CHARACTER)?.pop() || ''))
    }
    // All other templates
    return String(startText?.split(NEW_LINE_CHARACTER)?.pop() || '').endsWith(template)
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
      getTextSelection()

      if (selectedText.text.length !== 0) {
        return
      }

      const startText = rawMarkdown.value.substring(0, selectedText.start)
      // If the previous line is not empty and doesn't already have an empty line above it (if so, empty string)
      // If the line does not start with a new line, insert two, otherwise, insert one new line
      const needsNewLine: string = startText.length === 0 || startText.endsWith(`${NEW_LINE_CHARACTER}${NEW_LINE_CHARACTER}`) ? '' : /(.*)?[^\n]$/.test(startText) ? `${NEW_LINE_CHARACTER}${NEW_LINE_CHARACTER}` : NEW_LINE_CHARACTER

      let markdownTemplate: string = ''

      switch (template) {
        case 'task':
          // Do nothing if the template already exists
          if (singleLineTemplateExists(startText, MARKDOWN_TEMPLATE_TASK)) {
            await focusTextarea()
            return
          }
          // needsNewLine not needed here
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_TASK
          break
        case 'unordered-list':
          // Do nothing if the template already exists
          if (singleLineTemplateExists(startText, MARKDOWN_TEMPLATE_UL)) {
            await focusTextarea()
            return
          }
          // needsNewLine not needed here
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_UL
          break
        case 'ordered-list':
          // Do nothing if the template already exists
          if (singleLineTemplateExists(startText, MARKDOWN_TEMPLATE_OL)) {
            await focusTextarea()
            return
          }
          // needsNewLine not needed here
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_OL
          break
        case 'blockquote':
          // Do nothing if the template already exists
          if (singleLineTemplateExists(startText, MARKDOWN_TEMPLATE_BLOCKQUOTE)) {
            await focusTextarea()
            return
          }
          // needsNewLine not needed here
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_BLOCKQUOTE
          break
        case 'codeblock':
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_CODEBLOCK
          break
        case 'table':
          markdownTemplate =
          needsNewLine +
          MARKDOWN_TEMPLATE_TABLE
          break
      }

      // If no template was found, exit
      if (!markdownTemplate) {
        return
      }

      rawMarkdown.value = startText + markdownTemplate + rawMarkdown.value.substring(selectedText.end)

      // Always focus back on the textarea
      await focusTextarea()

      switch (template) {
        case 'codeblock':
          // Move the cursor to the language string of the codeblock
          // (needsNewLine.length + 3 characters for codeblock ```)
          textarea.selectionStart = selectedText.start + (needsNewLine.length + 3)
          // Move the end of the selection to the end of the default language so it is selected
          textarea.selectionEnd = selectedText.start + (needsNewLine.length + 3) + DEFAULT_CODEBLOCK_LANGUAGE.length
          break
        default:
          // Move the cursor to the end of the table markdown
          textarea.selectionEnd = selectedText.start + markdownTemplate.length
          break
      }
    } catch (err) {
      console.warn('insertMarkdownTemplate', err)
    }
  }

  /**
   * Insert a new line in the editor.
   * Conditionally addor remove inline templates if the previous line also started with one.
   * @returns {Promise<void>}
   */
  const insertNewLine = async (): Promise<void> => {
    try {
      const textarea = getTextarea()

      if (!textarea) {
        return
      }

      // Update the selected text object
      getTextSelection()

      // Check the current line to see if we're within another format block (e.g. list, code, etc.)
      const startText = rawMarkdown.value.substring(0, selectedText.start)
      // Grab the last line before the cursor
      const lastLine = startText?.split(NEW_LINE_CHARACTER)?.pop() || ''

      let newLineContent = NEW_LINE_CHARACTER

      // Should we remove the new line template on second Enter keypress
      let removeNewLineTemplate = false
      let templateLength = 0

      const newLineTemplates = [
        MARKDOWN_TEMPLATE_TASK, // Task template **must** be processed before UL template since they share starting chars
        MARKDOWN_TEMPLATE_UL,
        MARKDOWN_TEMPLATE_OL,
        MARKDOWN_TEMPLATE_BLOCKQUOTE,
      ]

      // Loop through the new line templates.
      // If the last line before the \n starts with any formatting templates, also inject the template into the next line
      for (const template of newLineTemplates) {
        // Special handling for Ordered Lists
        if (template === MARKDOWN_TEMPLATE_OL) {
          if (/^\d{1,}\. /.test(lastLine.trimStart())) {
            // Remove the `1` in the ordered list template
            const numberSuffix = MARKDOWN_TEMPLATE_OL.replace('1', '')
            // Split the line by the `. ` string after the number, and get the first entry (which should be the list number)
            const listNumber = Number(lastLine.trimStart().split(numberSuffix)[0])
            if (!isNaN(listNumber) && listNumber > 0) {
              // Increment the number for the next list item
              const newLineNumber: number = listNumber + 1
              // Get the template length
              templateLength = String(newLineNumber + numberSuffix).length

              // If the last list item is empty, remove the template instead
              if (/^\d{1,}\. $/.test(lastLine.trimStart())) {
                removeNewLineTemplate = true
              } else {
                // Add a new line appended with the same template with indentation, if applicable
                newLineContent += lastLine.split(listNumber + numberSuffix)[0] + newLineNumber + numberSuffix
              }
            }
            // We found a match, so exit the loop
            break
          }
        } else {
          // All other templates (other than ordered list)
          if (lastLine.trimStart().startsWith(template)) {
            templateLength = template.length
            // If the last list item is empty, remove the template instead
            if (lastLine.trimStart() === template) {
              removeNewLineTemplate = true
            } else {
              // Add a new line appended with the same template with indentation, if applicable
              newLineContent += lastLine.split(template)[0] + template
            }
            // We found a match, so exit the loop
            break
          }
        }
      }

      let indentationSpaces = ''
      // If newline template is not needed, check if we should keep the indentation level
      if (newLineContent === NEW_LINE_CHARACTER) {
        Array.from(Array(lastLine.length - lastLine.trimStart().length).keys()).forEach(() => (indentationSpaces += ' '))
      }

      // Update the raw markdown content
      rawMarkdown.value = removeNewLineTemplate
        ? rawMarkdown.value.substring(0, selectedText.start - lastLine.length) + rawMarkdown.value.substring(selectedText.end)
        : (startText + newLineContent + indentationSpaces + rawMarkdown.value.substring(selectedText.end))

      // Always focus back on the textarea
      await focusTextarea()

      // Update the cursor position
      textarea.selectionEnd = removeNewLineTemplate ? selectedText.start - templateLength : selectedText.start + newLineContent.length + indentationSpaces.length
    } catch (err) {
      console.warn('insertNewLine', err)
    }
  }

  return {
    selectedText,
    getTextSelection,
    toggleInlineFormatting,
    toggleTab,
    insertMarkdownTemplate,
    insertNewLine,
  }
}
