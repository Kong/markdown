/** The time, in milliseconds, to debounce the textarea input event */
export const EDITOR_DEBOUNCE_TIMEOUT: number = 500

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
