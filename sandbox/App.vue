<template>
  <div class="sandbox-container">
    <main>
      <h3>This is an example of a page</h3>
      <p>This is more content on the page.</p>
      <p>Mollitia aspernatur itaque mollitia suscipit adipisci consectetur error quis. Pariatur et magni mollitia quia. Ut sit quos.</p>
      <MarkdownUi
        v-model="content"
        :editable="editable"
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

const editable = ref<boolean>(true)

const contentUpdated = (markdown: string) => {
  console.log('content updated: %o', markdown)
}

const modeChanged = (mode: string) => {
  console.log('mode', mode)
  if (mode === 'edit' || mode === 'split') {
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
  padding: $kui-space-0 $kui-space-70;
}
</style>
