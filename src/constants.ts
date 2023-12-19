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

/** The markdown template for a codeblock */
export const MARKDOWN_TEMPLATE_CODEBLOCK =
'```' + DEFAULT_CODEBLOCK_LANGUAGE + '\n' +
'\n' +
'```'

/** The markdown template for a task */
export const MARKDOWN_TEMPLATE_TASK = '- [ ] ' // Ensure trailing space remains

/** The markdown template for a table */
export const MARKDOWN_TEMPLATE_TABLE =
'| Column1 | Column2 | Column3 |\n' +
'| :--- | :--- | :--- |\n' +
'| Content | Content | Content |\n'
