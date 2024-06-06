import { ref } from 'vue'
import useShiki from '@/composables/useShiki'
import { NEW_LINE_CHARACTER, COPY_ICON_SVG, HEADER_LINK_ICON_SVG } from '@/constants'
import type { Theme } from '@/types'

// markdown-it
import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import anchor from 'markdown-it-anchor'
import attrs from 'markdown-it-attrs'
import deflist from 'markdown-it-deflist'
import { frontmatterPlugin } from '@mdit-vue/plugin-frontmatter'
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
import { Buffer } from 'buffer'

// MarkdownIt instance
const md = ref()

export default function useMarkdownIt() {
  /** Initialize markdown-it - ideally called in the `onBeforeMount` hook */
  const init = async (theme: Theme = 'light'): Promise<void> => {
    const { MarkdownItShiki } = useShiki()

    // @ts-ignore - Polyfill for Buffer in the browser environment
    window.Buffer = Buffer

    md.value = MarkdownIt({
      html: false, // Keep disabled to prevent XSS
      xhtmlOut: true, // Use '/' to close single tags (<br />)
      linkify: true, // Autoconvert URL-like text to links
      breaks: true, // Convert '\n' in paragraphs into <br>
      typographer: true, // Enable some language-neutral replacement + quotes beautification
      quotes: '“”‘’',
    })
      .use(await MarkdownItShiki(theme))
      .use(anchor, {
        level: 2,
        slugify: s => slugify(s),
        permalink: anchor.permalink.ariaHidden({
          placement: 'before',
          class: 'header-anchor', // The class applied to the anchor tag; allows for styling
          // Utilize an SVG icon instead of a `#` string
          symbol: HEADER_LINK_ICON_SVG,
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
        enabled: false, // Not enabled since checking the box doesn't update the markdown
      })
      .use(frontmatterPlugin, {
        // options
        grayMatterOptions: {
          language: 'yaml',
        },
        renderExcerpt: false,
      })

    // disable converting email to link
    md.value.linkify.set({ fuzzyLink: false })

    // Customize table element
    md.value.renderer.rules.table_open = () => '<div class="markdown-ui-table-wrapper"><table class="markdown-ui-table">' + NEW_LINE_CHARACTER
    md.value.renderer.rules.table_close = () => '</table></div>' + NEW_LINE_CHARACTER

    const getDefaultRenderer = (original: any): () => void => {
      return original || function(tokens: Record<string, any>[], idx: number, options: Record<string, any>, env: any, self: Record<string, any>) {
        return self.renderToken(tokens, idx, options)
      }
    }

    // Configure custom external links
    const defaultLinkRenderer = getDefaultRenderer(md.value.renderer.rules.link_open)
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

    // Configure custom code blocks
    const defaultCodeblockRenderer = getDefaultRenderer(md.value.renderer.rules.fence)
    md.value.renderer.rules.fence = (tokens: Record<string, any>[], idx: number, options: Record<string, any>, env: any, self: Record<string, any>) => {
      const content: string = tokens[idx].content
        // Strip out double-quote characters
        .replace(/"/g, '&quot;')
        // Strip out single-quote characters
        .replace(/'/g, '&apos;')
        // Remove a trailing new line character, if it exists
        .replace(/\n$/, '')
      const originalContent = defaultCodeblockRenderer(tokens, idx, options, env, self)

      if (content.length === 0) {
        return originalContent
      }

      // Styles injected from `src/components/MarkdownContent.vue`
      // The event is bound to an element with `.kong-markdown-code-block-copy[data-copytext]`
      return `
        <div class="kong-markdown-code-block-container" style="position: relative">
          ${originalContent}
          <button class="kong-markdown-code-block-copy" data-copytext="${content}" aria-label="Copy code" tabindex="0" type="button" data-testid="copy-code-button">
            ${COPY_ICON_SVG}
          </button>
        </div>
      `
    }
  }

  return {
    md,
    init,
  }
}
