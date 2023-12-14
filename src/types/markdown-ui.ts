/** The current mode of the markdown component */
export type MarkdownMode = 'view' | 'edit'

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
}

/** The type of markdown template to insert */
export type MarkdownTemplate =
  | 'table'
  | 'codeblock'
  | 'task'

export interface TemplateOption {
  label: string
  action: MarkdownTemplate
}

export interface TextAreaInputEvent {
  target: Pick<HTMLTextAreaElement, 'value'>
}
