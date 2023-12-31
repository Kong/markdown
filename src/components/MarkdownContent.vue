<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown-content"
    :class="`mode-${mode}`"
    v-html="markdownContent"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { MODE_INJECTION_KEY } from '@/injection-keys'
import type { MarkdownMode } from '@/types'

const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('read'))

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const markdownContent = ref<string>(props.content)

watch(() => props.content, (content: string): void => {
  markdownContent.value = content
}, { immediate: true })
</script>

<style lang="scss" scoped>
@import "../assets/mixins";

// Computed component variables
$header-anchor-offset-top: calc(var(--kui-space-80, $kui-space-80) + 2px);

// Markdown Preview content styles
.markdown-content {
  color: var(--kui-color-text, $kui-color-text);
  flex: 1;
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-30, $kui-font-size-30);
  font-weight: var(--kui-font-weight-regular, $kui-font-weight-regular);
  line-height: var(--kui-line-height-40, $kui-line-height-40);
  margin: 0;
  padding: var(--kui-space-40, $kui-space-40) var(--kui-space-70, $kui-space-70);
  word-wrap: break-word;

  &.mode-read {
    // Remove left and right padding in read mode
    padding: var(--kui-space-0, $kui-space-0);
  }

  :deep() {
    // Base font size and line height
    font-size: var(--kui-font-size-40, $kui-font-size-40);
    line-height: var(--kui-line-height-40, $kui-line-height-40);

    h1, h2, h3, h4, h5, h6 {
      color: var(--kui-color-text, $kui-color-text);
      font-family: var(--kui-font-family-text, $kui-font-family-text);
      font-weight: var(--kui-font-weight-bold, $kui-font-weight-bold);
      margin-top: var(--kui-space-0, $kui-space-0);
    }

    h1 {
      font-size: var(--kui-font-size-70, $kui-font-size-70);
      letter-spacing: var(--kui-letter-spacing-minus-50, $kui-letter-spacing-minus-50);
      line-height: var(--kui-line-height-60, $kui-line-height-60);
      margin-bottom: var(--kui-space-70, $kui-space-70);
    }

    h2 {
      font-size: var(--kui-font-size-60, $kui-font-size-60);
      letter-spacing: var(--kui-letter-spacing-minus-40, $kui-letter-spacing-minus-40);
      line-height: var(--kui-line-height-50, $kui-line-height-50);
      margin-bottom: var(--kui-space-60, $kui-space-60);
    }

    h3 {
      font-size: var(--kui-font-size-50, $kui-font-size-50);
      letter-spacing: var(--kui-letter-spacing-minus-30, $kui-letter-spacing-minus-30);
      line-height: var(--kui-line-height-40, $kui-line-height-40);
      margin-bottom: var(--kui-space-50, $kui-space-50);
    }

    h4 {
      font-size: var(--kui-font-size-40, $kui-font-size-40);
      letter-spacing: var(--kui-letter-spacing-minus-20, $kui-letter-spacing-minus-20);
      line-height: var(--kui-line-height-30, $kui-line-height-30);
      margin-bottom: var(--kui-space-40, $kui-space-40);
    }

    h5, h6 {
      font-size: var(--kui-font-size-30, $kui-font-size-30);
      letter-spacing: var(--kui-letter-spacing-minus-10, $kui-letter-spacing-minus-10);
      line-height: var(--kui-line-height-30, $kui-line-height-30);
      margin-bottom: var(--kui-space-30, $kui-space-30);
    }

    // Adjust h2-66 tags for scroll-to margin & padding
    // Exclude the h1 header
    h2, h3, h4, h5, h6 {
      margin-top: calc(var(--kui-space-20, $kui-space-20) * -1);
      padding-top: var(--kui-space-70, $kui-space-70);
      position: relative;

      a.header-anchor {
        font-size: var(--kui-font-size-30, $kui-font-size-30);
        left: 0;
        line-height: 1;
        margin-left: calc(var(--kui-space-60, $kui-space-60) * -1);
        opacity: 0;
        padding-right: var(--kui-space-20, $kui-space-20);
        position: absolute;
        text-decoration: none;
        top: $header-anchor-offset-top;
        transition: opacity 0.2s ease-in-out;
        user-select: none;

        // TODO: Re-enable opacity and add left padding to `.markdown-content` if you want to see the header links on hover
        // &:hover {
        //   opacity: 1;
        // }
      }

      &:hover {
        a.header-anchor {
          opacity: 1;
        }
      }
    }

    a {
      color: var(--kui-color-text-primary, $kui-color-text-primary);
      text-decoration: none;

      &:hover {
        color: var(--kui-color-text-primary-stronger, $kui-color-text-primary-stronger);
      }

      // Add external link icons
      &[href^="http://"],
      &[href^="https://"] {
        background-image: url('data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiBvdXRib3VuZCIKICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtaGlkZGVuPSJ0cnVlIiBhcmlhLWxhYmVsPSIob3BlbnMgbmV3IHdpbmRvdykiIGZvY3VzYWJsZT0iZmFsc2UiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1Ij4KICA8cGF0aCBmaWxsPSIjYWFhIiBkPSJNMTguOCw4NS4xaDU2bDAsMGMyLjIsMCw0LTEuOCw0LTR2LTMyaC04djI4aC00OHYtNDhoMjh2LThoLTMybDAsMGMtMi4yLDAtNCwxLjgtNCw0djU2QzE0LjgsODMuMywxNi42LDg1LjEsMTguOCw4NS4xeiIgLz4KICA8cG9seWdvbiBmaWxsPSIjYWFhIiBwb2ludHM9IjQ1LjcsNDguNyA1MS4zLDU0LjMgNzcuMiwyOC41IDc3LjIsMzcuMiA4NS4yLDM3LjIgODUuMiwxNC45IDYyLjgsMTQuOSA2Mi44LDIyLjkgNzEuNSwyMi45IiAvPgo8L3N2Zz4K');
        background-position: right center;
        background-repeat: no-repeat;
        background-size: 16px 16px;
        padding-right: var(--kui-space-60, $kui-space-60);
      }
    }

    p {
      margin: var(--kui-space-0, $kui-space-0) var(--kui-space-0, $kui-space-0) var(--kui-space-70, $kui-space-70);
    }

    small {
      font-size: var(--kui-font-size-20, $kui-font-size-20);
      line-height: var(--kui-line-height-20, $kui-line-height-20);
    }

    hr {
      border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
      margin: var(--kui-space-70, $kui-space-70) var(--kui-space-0, $kui-space-0);
    }

    ul {
      margin: var(--kui-space-0, $kui-space-0) var(--kui-space-0, $kui-space-0) var(--kui-space-70, $kui-space-70);
      padding-left: var(--kui-space-70, $kui-space-70);
    }

    ol {
      margin: var(--kui-space-0, $kui-space-0) var(--kui-space-0, $kui-space-0) var(--kui-space-70, $kui-space-70);
      padding-left: var(--kui-space-70, $kui-space-70);
    }

    li {
      margin-bottom: var(--kui-space-20, $kui-space-20);
    }

    blockquote {
      border-left: var(--kui-border-width-30, $kui-border-width-30) solid var(--kui-color-border, $kui-color-border);
      color: var(--kui-color-text-neutral, $kui-color-text-neutral);
      margin: var(--kui-space-70, $kui-space-70) var(--kui-space-0, $kui-space-0);
      padding: var(--kui-space-0, $kui-space-0) var(--kui-space-70, $kui-space-70);
    }

    // task list
    .contains-task-list {
      list-style-type: none;
      padding-left: var(--kui-space-0, $kui-space-0);
    }

    // inline code
    code {
      font-family: var(--kui-font-family-code, $kui-font-family-code);
    }

    // Inline code within the content area
    p code {
      background: var(--kui-color-background-neutral-weaker, $kui-color-background-neutral-weaker);
      border-radius: var(--kui-border-radius-20, $kui-border-radius-20);
      color: $kui-color-text;
      font-size: var(--kui-font-size-30, $kui-font-size-30);
      padding: var(--kui-space-10, $kui-space-10) var(--kui-space-20, $kui-space-20);
      white-space: break-spaces;
      word-wrap: break-word;
    }

    pre {
      border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
      border-radius: var(--kui-border-radius-40, $kui-border-radius-40);
      font-family: var(--kui-font-family-code, $kui-font-family-code);
      font-size: var(--kui-font-size-30, $kui-font-size-30);
      line-height: var(--kui-line-height-30, $kui-line-height-30);
      margin: var(--kui-space-0, $kui-space-0);
      margin-bottom: var(--kui-space-70, $kui-space-70);
      overflow-wrap: break-word;
      overflow-x: auto;
      padding: var(--kui-space-70, $kui-space-70);
      white-space: pre;
      word-break: normal;
      word-spacing: normal;
      word-wrap: normal;
    }

    // Styles for fenced code block copy button in `src/composables/useMarkdownIt.ts`
    .kong-markdown-code-block-copy {
      @include toolbar-button;
      color: var(--kui-color-text-neutral-weak, $kui-color-text-neutral-weak);
      position: absolute;
      right: 4px;
      top: 4px;
    }

    .line.highlighted {
      background-color: #eee;
      display: inline-block;
      width: 100%;
    }

    img {
      max-width: 100%;
    }

    .markdown-ui-table-wrapper {
      max-width: 100%;
      overflow-x: auto;
      width: 100%;
    }

    table {
      border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
      border-collapse: collapse;
      border-spacing: 0;
      color: var(--kui-color-text, $kui-color-text);
      font-size: var(--kui-font-size-30, $kui-font-size-30);

      thead th {
        background-color: var(--kui-color-background-neutral-weaker, $kui-color-background-neutral-weaker);
        border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border-neutral-weaker, $kui-color-border-neutral-weaker);
        font-weight: var(--kui-font-weight-semibold, $kui-font-weight-semibold);
        padding: var(--kui-space-40, $kui-space-40);
        vertical-align: text-top;
        white-space: nowrap;

        &:not(:last-of-type) {
          border-right-color: var(--kui-color-border-neutral-weak, $kui-color-border-neutral-weak);
        }
      }

      tbody td {
        border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
        padding: var(--kui-space-40, $kui-space-40);
        vertical-align: text-top;
      }
    }

    // mermaid charts
    .mermaid {
      svg {
        max-width: 100%;
      }
    }
  }
}
</style>
