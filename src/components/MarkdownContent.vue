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
$header-anchor-offset-top: calc(var(--kui-space-50, $kui-space-50) + 2px);

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
    font-size: var(--kui-font-size-40, $kui-font-size-40);
    line-height: var(--kui-line-height-40, $kui-line-height-40);

    // Adjust h2-66 tags for scroll-to margin & padding
    // Exclude the h1 header
    h2, h3, h4, h5, h6 {
      margin-top: calc(var(--kui-space-20, $kui-space-20) * -1);
      padding-top: var(--kui-space-50, $kui-space-50);
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
      @include icon-button;
      position: absolute;
      right: var(--kui-space-40, $kui-space-40);
      top: var(--kui-space-40, $kui-space-40);
    }

    .line.highlighted {
      background-color: #eee;
      display: inline-block;
      width: 100%;
    }

    img {
      max-width: 100%;
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
