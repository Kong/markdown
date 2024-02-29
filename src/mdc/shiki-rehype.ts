import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import type { MdcThemeOptions } from '..'
import type { Highlighter } from 'shiki'
import { useShikiHighlighter } from '@/composables/useShikiHighlighter'

export interface RehypeHighlightOption {
  theme?: MdcThemeOptions
  highlighter?: Highlighter
}

const defaults: RehypeHighlightOption = {
  theme: {},
  highlighter: useShikiHighlighter(),
}

export default rehypeHighlight

export function rehypeHighlight(opts: RehypeHighlightOption = {}) {
  const options = { ...defaults, ...opts }

  return async (tree: Root) => {
    const tasks: Promise<void>[] = []
    const styles: string[] = []
    visit(
      tree,
      node => ['pre', 'code'].includes((node as Element).tagName) && !!((node as Element).properties?.language || (node as Element).properties?.highlights),
      (node) => {
        const _node = node as Element
        const highlights = typeof _node.properties!.highlights === 'string'
          ? _node.properties!.highlights.split(/[,\s]+/).map(Number)
          : (Array.isArray(_node.properties!.highlights) ? _node.properties!.highlights.map(Number) : [])

        const task = options.highlighter!(
          toString(node as any),
          _node.properties!.language as string,
          options.theme!,
          {
            highlights: highlights.filter(Boolean),
            meta: _node.properties.meta as string,
          },
        )
          .then(({ tree, className, style, inlineStyle }) => {
            _node.properties!.className = ((_node.properties!.className || '') + ' ' + className).trim()
            _node.properties!.style = ((_node.properties!.style || '') + ' ' + inlineStyle).trim()

            if ((_node.children[0] as Element)?.tagName === 'code') {
              (_node.children[0] as Element).children = tree
            } else {
              _node.children = (tree[0] as any).children || tree
            }

            if (style) { styles.push(style) }
          })

        tasks.push(task)
      },
    )

    if (tasks.length) {
      await Promise.all(tasks)

      tree.children.push({
        type: 'element',
        tagName: 'style',
        children: [{ type: 'text', value: cleanCSS(styles.join('')) }],
        properties: {},
      })
    }
  }
}

const cleanCSS = (css: string) => {
  const styles = css
    .split('}')
    .filter(s => Boolean(s.trim()))
    .map(s => s.trim() + '}')

  return Array
    .from(new Set(styles))
    .join('')
}
