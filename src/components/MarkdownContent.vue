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
  // Markdown Preview content styles
.markdown-content {
  margin: 0;
  padding: 0;

  :deep() {
    font-size: $kui-font-size-40;
    line-height: $kui-line-height-40;

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
      font-family: $kui-font-family-code;
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
