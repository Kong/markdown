<template>
  <div class="sandbox-container">
    <main>
      <MarkdownUi
        v-model="content"
        :editable="editable"
        mode="edit"
        @save="contentSaved"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { MarkdownUi } from '../src'
import mockResponse from './mock-document-response'

const editable = ref<boolean>(true)

const contentSaved = (markdown: string) => {
  console.log('saved!', JSON.stringify(markdown))
}

const mockMarkdownResponse = async (): Promise<Record<string, any>> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return mockResponse
}

const content = ref<string>('')

onBeforeMount(async () => {
  // Simulate fetching the document
  const { content: markdownContent } = await mockMarkdownResponse()

  content.value = markdownContent
})
</script>
