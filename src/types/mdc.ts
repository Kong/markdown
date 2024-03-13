import type { ElementContent } from 'hast'
import type { BuiltinTheme } from 'shiki'

export type MDCText = {
  type: 'text'
  value: string
}

export type MDCElement = {
  type: 'element'
  tag: string
  props: Record<string, any> | undefined
  children: Array<MDCElement | MDCText>
}

export type MDCNode = MDCElement | MDCText

export type MDCRoot = {
  type: 'root'
  children: Array<MDCNode>
}

export interface MDCData extends Record<string, any> {
  title: string,
  description: string,
}

export type MdcThemeOptions = BuiltinTheme | string | Record<string, BuiltinTheme | string>

export interface HighlighterOptions {
  highlights?: number[]
  meta?: string
}

export interface HighlightResult {
  tree: ElementContent[],
  className?: string,
  style?: string,
  inlineStyle?: string,
}

export type Highlighter = (code: string, lang: string, theme: MdcThemeOptions, options: Partial<HighlighterOptions>) => Promise<HighlightResult>
