/** The time, in milliseconds, to debounce the textarea input event */
export const EDITOR_DEBOUNCE_TIMEOUT: number = 400

export const DEFAULT_CODEBLOCK_LANGUAGE: string = 'markdown'

export enum InlineFormatWrapper {
  Bold = '**',
  Italic = '_',
  Underline = '++',
  Strikethrough = '~~',
  Subscript = '~',
  Superscript = '^',
  Mark = '==',
  Code = '`',
}

/** The height of the .markdown-ui-toolbar */
export const TOOLBAR_HEIGHT: string = '40px'

/** The markdown new line character */
export const NEW_LINE_CHARACTER = '\n'

/** The markdown template for a codeblock */
export const MARKDOWN_TEMPLATE_CODEBLOCK =
'```' + DEFAULT_CODEBLOCK_LANGUAGE + NEW_LINE_CHARACTER +
NEW_LINE_CHARACTER +
'```'

/** The markdown template for a table */
export const MARKDOWN_TEMPLATE_TABLE =
'| Column1 | Column2 | Column3 |' + NEW_LINE_CHARACTER +
'| :--- | :--- | :--- |' + NEW_LINE_CHARACTER +
'| Content | Content | Content |'

/** The markdown template for a task. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_TASK = '- [ ] '

/** The markdown template for an unordered list. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_UL = '- '
/** The markdown template for an ordered list. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_OL = '1. '

/** The markdown template for a blockquote. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_BLOCKQUOTE = '> '

/** The inline SVG to display as a header link */
export const HEADER_LINK_SVG = '<svg class="header-anchor-icon" viewBox="0 0 16 16" version="1.1" width="14" height="14" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>'
