<template>
  <div class="sandbox-container">
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
      <MarkdownUi
        v-model="content"
        downloadable
        editable
        filename="example-document"
        :mode="mode"
        @cancel="cancelEdit"
        @mode="modeChanged"
        @save="contentSaved"
        @update:model-value="contentUpdated"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { MarkdownUi } from '../src'
import mockResponse from './mock-document-response'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contentUpdated = (markdown: string) => {
  console.log('content updated')
}

const mode = ref<string>('read')
const modeChanged = (m: string) => {
  mode.value = m
  if (mode.value === 'edit' || mode.value === 'split') {
    originalContent.value = content.value
    console.log('begin editing')
  }
}

const cancelEdit = () => {
  content.value = originalContent.value
  console.log('canceled')
}

const contentSaved = (markdown: string) => {
  originalContent.value = content.value
  console.log('saved! %o', markdown)
}

const mockMarkdownResponse = async (): Promise<Record<string, any>> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return mockResponse
}

const originalContent = ref<string>('')
const content = ref<string>('')

onBeforeMount(async () => {
  // Simulate fetching the document
  const { content: markdownContent } = await mockMarkdownResponse()

  // Store the original content in case the user cancels
  originalContent.value = markdownContent
  // Copy the content for editing
  content.value = originalContent.value
})
</script>

<style lang="scss" scoped>
.sandbox-container {
  font-family: $kui-font-family-text;
  padding: var(--kui-space-70, $kui-space-70);
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
