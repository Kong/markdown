import { ref } from 'vue'
import useShikiji from './useShikiji'

// markdown-it
import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import deflist from 'markdown-it-deflist'
// @ts-ignore - export does exist
import { full as emoji } from 'markdown-it-emoji'
import footnote from 'markdown-it-footnote'
import insert from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import tasklists from 'markdown-it-task-lists'
import markdownItTextualUml from 'markdown-it-textual-uml'
import slugify from '@sindresorhus/slugify'

// MarkdownIt instance
const md = ref()

export default function useMarkdownIt(theme: 'light' | 'dark' = 'light') {
  /** Initialize markdown-it - ideally called in the `onBeforeMount` hook */
  const init = async (): Promise<void> => {
    const { MarkdownItShikiji } = useShikiji()

    md.value = MarkdownIt({
      html: false, // Keep disabled to prevent XSS
      xhtmlOut: true, // Use '/' to close single tags (<br />)
      linkify: true, // Autoconvert URL-like text to links
      breaks: true, // Convert '\n' in paragraphs into <br>
      typographer: true, // Enable some language-neutral replacement + quotes beautification
      quotes: '“”‘’',
    })
      .use(await MarkdownItShikiji(theme))
      .use(anchor, {
        level: 2,
        slugify: s => slugify(s),
        permalink: anchor.permalink.ariaHidden({
          // &#128279
          placement: 'before',
          class: 'header-anchor', // The class applied to the anchor tag; allows for styling
          // Utilize an SVG icon instead of a `#` string
          symbol: '<svg class="header-anchor-icon" viewBox="0 0 16 16" version="1.1" width="14" height="14" aria-hidden="true"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>',
        }),
      })
      .use(abbreviation)
      .use(attrs, {
        // optional, these are default options
        leftDelimiter: '{{', // Do not use single curly, it will conflict with code line syntax highlighting
        rightDelimiter: '}}', // Do not use single curly, it will conflict with code line syntax highlighting
        allowedAttributes: ['id', 'class', 'style', 'target', 'rel', /^data.*$/], // allow-list
      })
      .use(markdownItTextualUml)
      .use(deflist)
      .use(emoji)
      .use(footnote)
      .use(insert)
      .use(mark)
      .use(subscript)
      .use(superscript)
      .use(tasklists, {
        label: true,
      })

    // disable converting email to link
    md.value.linkify.set({ fuzzyLink: false })

    // Customize table element
    md.value.renderer.rules.table_open = () => '<table class="markdown-ui-table">\n'

    // Configure external links
    const defaultLinkRenderer = md.value.renderer.rules.link_open ||
      function(tokens: Record<string, any>[], idx: number, options: Record<string, any>, env: any, self: Record<string, any>) {
        return self.renderToken(tokens, idx, options)
      }

    const externalAnchorAttributes: Record<string, string> = { target: '_blank' }

    md.value.renderer.rules.link_open = (tokens: Record<string, any>[], idx: number, options: Record<string, any>, env: any, self: Record<string, any>) => {
      Object.keys(externalAnchorAttributes).forEach((attribute: string) => {
        const aIndex = tokens[idx].attrIndex(attribute)
        const value = externalAnchorAttributes[attribute]
        if (tokens[idx].attrs?.length && String(tokens[idx].attrs[0] || '').includes('http')) {
          if (aIndex < 0) {
            tokens[idx].attrPush([attribute, value]) // add new attribute
          } else {
            tokens[idx].attrs[aIndex][1] = value
          }
        }
      })
      return defaultLinkRenderer(tokens, idx, options, env, self)
    }
  }

  return {
    md,
    init,
  }
}
