// Get a generic `@kong/icons` interface for the option prop
import type { BoldIcon as GenericIcon } from '@kong/icons'
import type { MarkdownItEnv } from '@mdit-vue/types'

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
  | 'link'
  | 'image'

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
  | 'ordered-list'
  | 'blockquote'

export interface TemplateOption {
  label: string
  action: MarkdownTemplate
  icon: typeof GenericIcon
}

export interface TextAreaInputEvent {
  target: Pick<HTMLTextAreaElement, 'value'>
}

/** The color theme of the component */
export type Theme = 'light' | 'dark'

/** The markdown document frontmatter */
export type Frontmatter = Pick<MarkdownItEnv, 'frontmatter'>

/** The payload to emit for update:modelValue and save events */
export interface EmitUpdatePayload {
  content: string
  frontmatter: Frontmatter | undefined
}
