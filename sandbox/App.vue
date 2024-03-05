<template>
  <div
    class="sandbox-container"
    :class="[activeTheme]"
  >
    <main>
      <div class="page-header">
        <h1><code>@kong/markdown</code></h1>
        <a
          href="https://github.com/Kong/markdown"
          target="_blank"
        >GitHub Docs</a>
      </div>
      <p>This page contains a static markdown document as well as an interactive markdown editor.</p>
      <p v-if="mode === 'read'">
        Begin by clicking the <b>Edit</b> button on the right.
      </p>
      <p v-else>
        Make changes to the document and see the rendered markdown in the preview pane. For a better editing experience, try enabling the <b>Fullscreen</b> editor.
      </p>
      <hr>
      <Suspense>
        <MDCRenderer
          v-if="ast.body"
          :body="ast.body"
          :data="ast.data"
        />
      </Suspense>
      <MarkdownUi
        v-model="editorContent"
        downloadable
        editable
        filename="example-document"
        :mode="mode"
        @cancel="cancelEdit"
        @mode="modeChanged"
        @save="contentSaved"
        @update:frontmatter="frontmatterUpdated"
        @update:model-value="contentUpdated"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { MarkdownUi } from '../src'
import mockResponse from './mock-document-response'
import { usePreferredColorScheme } from '@vueuse/core'
import { MDCRenderer, parseMarkdown, rehypeHighlight, createShikiHighlighter } from '@nuxtjs/mdc/runtime'
// shiki imports
import MaterialThemePalenight from 'shiki/themes/material-theme-palenight.mjs'
import HtmlLang from 'shiki/langs/html.mjs'
import MdcLang from 'shiki/langs/mdc.mjs'
import TsLang from 'shiki/langs/typescript.mjs'
import VueLang from 'shiki/langs/vue.mjs'
import ScssLang from 'shiki/langs/scss.mjs'
import YamlLang from 'shiki/langs/yaml.mjs'

const ast = ref<{ data: Record<string, any> | null, body: Record<string, any> | null }>({
  data: null,
  body: null,
})

const preferredColorScheme = usePreferredColorScheme()
// Set the active theme from props.theme if set; otherwise use the user's browser's preferred color scheme
const activeTheme = computed(() => preferredColorScheme.value === 'dark' ? preferredColorScheme.value : 'light')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contentUpdated = (content: string) => {
  console.log('content updated')
}

const frontmatterUpdated = (frontmatter: Record<string, any> | undefined) => {
  console.log('frontmatter updated', frontmatter)
}

const mode = ref<string>('read')
const modeChanged = (m: string) => {
  mode.value = m
  if (mode.value === 'edit' || mode.value === 'split') {
    originalContent.value = editorContent.value
    console.log('begin editing')
  }
}

const cancelEdit = () => {
  editorContent.value = originalContent.value
  console.log('canceled')
}

const updateRenderer = async (markdownContent: string) => {
  const { data, body } = await parseMarkdown(markdownContent, {
    rehype: {
      plugins: {
        shikiji: {
          instance: rehypeHighlight,
          options: {
            theme: 'material-theme-palenight',
            highlighter: createShikiHighlighter({
              bundledThemes: {
                'material-theme-palenight': MaterialThemePalenight,
              },
              bundledLangs: {
                html: HtmlLang,
                mdc: MdcLang,
                vue: VueLang,
                yml: YamlLang,
                scss: ScssLang,
                ts: TsLang,
                typescript: TsLang,
              },
            }),
          },
        },
      },
    },
  })

  // Update refs
  ast.value.data = data
  ast.value.body = body
}

const contentSaved = ({ content, frontmatter }: any) => {
  originalContent.value = editorContent.value
  updateRenderer(editorContent.value)
  console.log('saved! %o', content, frontmatter)
}

const mockMarkdownResponse = async (): Promise<Record<string, any>> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return mockResponse
}

const originalContent = ref<string>('')
const editorContent = ref<string>('')

onBeforeMount(async () => {
  // Simulate fetching the document
  const { content: markdownContent } = await mockMarkdownResponse()

  await updateRenderer(markdownContent)

  // Store the original content in case the user cancels
  originalContent.value = markdownContent
  // Copy the content for editing
  editorContent.value = originalContent.value
})
</script>

<style lang="scss">
// Unscoped styles
html,
body {
  &:has(.sandbox-container.dark) {
    background: var(--kui-color-background-neutral-stronger, color.adjust($kui-color-background-neutral-strongest, $lightness: 5%));
  }
}
</style>

<style lang="scss" scoped>
.sandbox-container {
  background: $kui-color-background;
  color: $kui-color-text;
  font-family: $kui-font-family-text;
  padding: var(--kui-space-70, $kui-space-70);

  &.dark {
    background: color.adjust($kui-color-background-neutral-strongest, $lightness: 5%);
    color: $kui-color-text-inverse;

    a {
      color: color.adjust($color: $kui-color-text-primary, $lightness: 20%);

      &:hover {
        color: color.adjust($color: $kui-color-text-primary, $lightness: 10%);
      }

      &.header-anchor {
        fill: var(--kui-color-text-inverse, $kui-color-text-inverse);
      }
    }
  }
}

.page-header {
  align-items: baseline;
  gap: $kui-space-70;
  margin-bottom: $kui-space-70;

  @media (min-width: $kui-breakpoint-mobile) {
    display: flex;
  }

  h1 {
    margin-bottom: $kui-space-20;
    margin-top: $kui-space-0;

    @media (min-width: $kui-breakpoint-mobile) {
      margin-bottom: $kui-space-0;
    }
  }

  a {
    color: $kui-color-text-primary;
    display: inline-block;
    text-decoration: none;

    &:hover {
      color: $kui-color-text-primary-stronger;
    }

    &:active {
      color: $kui-color-text-primary-strongest;
    }
  }
}

button {
  white-space: nowrap;
}

hr {
  background: $kui-color-background-disabled;
  margin: $kui-space-70 $kui-space-0;
  width: 100%;
}
</style>
