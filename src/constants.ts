import type { InlineFormat } from './types'

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

/**
 * Dictionary of keyboard shortcut combinations.
 * [key: string]: Single keyboard letter.
 * [value: InlineFormat]: Text format to pass to `toggleInlineFormatting` function.
 */
export const KEYBOARD_SHORTCUTS: Record<string, InlineFormat> = {
  /** bold text */
  b: 'bold',
  /** italicize text */
  i: 'italic',
  /** underline text */
  u: 'underline',
}

/** Minimum editor and preview height, on mobile */
export const MIN_HEIGHT_MOBILE: string = '300px'
/** Minimum editor and preview height, on desktop */
export const MIN_HEIGHT_DESKTOP: string = '120px'
