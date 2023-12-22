<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown-content"
    v-html="markdownContent"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
  padding: 0 var(--kui-space-70, $kui-space-70);
  width: calc(100% - (#{$kui-space-70} * 2)); // 100% width minus 2x padding
  word-wrap: break-word;

  :deep() {
    font-size: $kui-font-size-40;
    line-height: $kui-line-height-40;

    // Adjust h2-66 tags for scroll-to margin & padding
    // Exclude the h1 header
    h2, h3, h4, h5, h6 {
      margin-top: -$kui-space-20;
      padding-top: $kui-space-50;
      position: relative;

      a.header-anchor {
        font-size: $kui-font-size-30;
        left: 0;
        line-height: 1;
        margin-left: -$kui-space-60;
        opacity: 0;
        padding-right: 4px;
        position: absolute;
        text-decoration: none;
        top: $header-anchor-offset-top;
        transition: opacity 0.2s ease-in-out;
        user-select: none;

        &:hover {
          opacity: 1;
        }
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
      padding-left: $kui-space-0;
    }

    // inline code
    code {
      font-family: $kui-font-family-code;
    }

    // code blocks
    pre {
      border-radius: $kui-border-radius-40;
      font-family: $kui-font-family-code;
      font-size: $kui-font-size-30;
      line-height: $kui-line-height-30;
      overflow-wrap: break-word;
      white-space: pre-wrap;
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
