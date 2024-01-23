/** The time, in milliseconds, to debounce the textarea input event */
export const EDITOR_DEBOUNCE_TIMEOUT: number = 400

export const DEFAULT_CODEBLOCK_LANGUAGE: string = 'markdown'

export enum InlineFormatWrapper {
  bold = '**',
  italic = '_',
  underline = '++',
  strikethrough = '~~',
  subscript = '~',
  superscript = '^',
  mark = '==',
  code = '`',
}

/** The height of the .markdown-ui-toolbar */
export const TOOLBAR_HEIGHT: string = '36px'

/** The markdown new line character */
export const NEW_LINE_CHARACTER = '\n'

/** The markdown template for a codeblock */
export const MARKDOWN_TEMPLATE_CODEBLOCK =
'```' + DEFAULT_CODEBLOCK_LANGUAGE + NEW_LINE_CHARACTER +
NEW_LINE_CHARACTER +
'```'

/** The markdown template for a table */
export const MARKDOWN_TEMPLATE_TABLE =
'| Header | Header | Header |' + NEW_LINE_CHARACTER +
'| :--- | :--- | :--- |' + NEW_LINE_CHARACTER +
'| Cell | Cell | Cell |'

/** The markdown template for a task. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_TASK = '- [ ] '
export const MARKDOWN_TEMPLATE_TASK_COMPLETED = '- [x] '

/** The markdown template for an unordered list. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_UL = '- '
/** The markdown template for an ordered list. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_OL = '1. '

/** The markdown template for a blockquote. Ensure trailing space remains */
export const MARKDOWN_TEMPLATE_BLOCKQUOTE = '> '

/** The markdown link template */
export const MARKDOWN_TEMPLATE_LINK = '[text](url)'

/** The inline SVG copy icon */
export const COPY_ICON_SVG = '<span class="kui-icon copy-icon button-icon" data-testid="kui-icon-wrapper-copy-icon" style="pointer-events:none; box-sizing: border-box; color: currentcolor; display: block; height: 20px; line-height: 0; width: 20px;"><svg data-testid="kui-icon-svg-copy-icon" fill="none" height="100%" role="img" viewBox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg"><path d="M5 22C4.45 22 3.97917 21.8042 3.5875 21.4125C3.19583 21.0208 3 20.55 3 20V6H5V20H16V22H5ZM9 18C8.45 18 7.97917 17.8042 7.5875 17.4125C7.19583 17.0208 7 16.55 7 16V4C7 3.45 7.19583 2.97917 7.5875 2.5875C7.97917 2.19583 8.45 2 9 2H18C18.55 2 19.0208 2.19583 19.4125 2.5875C19.8042 2.97917 20 3.45 20 4V16C20 16.55 19.8042 17.0208 19.4125 17.4125C19.0208 17.8042 18.55 18 18 18H9ZM9 16H18V4H9V16Z" fill="currentColor"></path></svg></span>'

/** The inline SVG to display as a header link */
export const HEADER_LINK_ICON_SVG = '<svg class="header-anchor-icon" viewBox="0 0 16 16" version="1.1" width="14" height="14" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>'
