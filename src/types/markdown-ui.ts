// Get a generic `@kong/icons` interface for the option prop
import type { BoldIcon as GenericIcon } from '@kong/icons'

/** The current mode of the markdown component */
export type MarkdownMode =
| 'read'
| 'edit'
| 'split'
| 'preview'

/** The text format to insert/wrap selection */
export type InlineFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'subscript'
  | 'superscript'
  | 'mark'
  | 'code'

export interface FormatOption {
  label: string
  action: InlineFormat
  icon: typeof GenericIcon
  keys?: string[]
}

/** The type of markdown template to insert */
export type MarkdownTemplate =
  | 'table'
  | 'codeblock'
  | 'task'
  | 'unordered-list'
  | 'blockquote'

export interface TemplateOption {
  label: string
  action: MarkdownTemplate
  icon: typeof GenericIcon
}

export interface TextAreaInputEvent {
  target: Pick<HTMLTextAreaElement, 'value'>
}
