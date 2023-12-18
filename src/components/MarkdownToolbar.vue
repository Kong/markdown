<template>
  <div class="markdown-ui-toolbar">
    <div class="toolbar-left">
      <button
        v-if="editable && mode !== 'edit'"
        data-testid="edit"
        @click="toggleEditMode"
      >
        Edit
      </button>
      <template v-if="mode === 'edit'">
        <button
          v-for="option in formatOptions"
          :key="option.label"
          :aria-label="option.label"
          :data-testid="`format-option-${option.action}`"
          @mousedown.prevent="emit('format-selection', option.action)"
        >
          {{ option.label }}
        </button>

        <div class="toolbar-divider" />

        <button
          v-for="option in templateOptions"
          :key="option.label"
          :aria-label="option.label"
          :data-testid="`template-option-${option.action}`"
          @mousedown.prevent="emit('insert-template', option.action)"
        >
          {{ option.label }}
        </button>

        <div class="toolbar-divider" />

        <button
          data-testid="toggle-html-preview"
          @mousedown.prevent="emit('toggle-html-preview')"
        >
          Toggle HTML Preview
        </button>
      </template>
    </div>
    <div class="toolbar-right">
      <div
        v-if="editable && mode === 'edit'"
        class="save-container"
      >
        <button
          data-testid="cancel"
          @click="toggleEditMode"
        >
          Cancel
        </button>
        <button
          data-testid="save"
          @click="saveChanges"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import type { Ref } from 'vue'
import { MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY } from '../injection-keys'
import type { MarkdownMode, FormatOption, TemplateOption, InlineFormat, MarkdownTemplate } from '../types'

const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('view'))
const editable: Ref<boolean> = inject(EDITABLE_INJECTION_KEY, ref(false))

const emit = defineEmits<{
  (e: 'format-selection', format: InlineFormat): void
  (e: 'insert-template', format: MarkdownTemplate): void
  (e: 'toggle-editing', editing: boolean): void
  (e: 'toggle-html-preview'): void
  (e: 'save'): void
}>()

const toggleEditMode = (): void => {
  emit('toggle-editing', mode.value !== 'edit')
}

const saveChanges = (): void => {
  emit('save')
  toggleEditMode()
}

const formatOptions: FormatOption[] = [
  { label: 'Bold', action: 'bold' },
  { label: 'Italic', action: 'italic' },
  { label: 'Underline', action: 'underline' },
  { label: 'Strikethrough', action: 'strikethrough' },
  { label: 'Subscript', action: 'subscript' },
  { label: 'Superscript', action: 'superscript' },
  { label: 'Mark', action: 'mark' },
  { label: 'Code', action: 'code' },
]

const templateOptions: TemplateOption[] = [
  { label: 'CodeBlock', action: 'codeblock' },
  { label: 'Table', action: 'table' },
  { label: 'Task', action: 'task' },
]
</script>

<style lang="scss" scoped>
.markdown-ui-toolbar {
  align-items: center;
  display: flex;
  gap: $kui-space-70;
  justify-content: space-between;
  overflow-x: auto;
  padding: $kui-space-0 $kui-space-30;

  .toolbar-left,
  .toolbar-right {
    align-items: center;
    display: flex;
    gap: $kui-space-20;
    padding: $kui-space-40 $kui-space-0;
  }

  .save-container {
    align-items: center;
    display: flex;
    gap: $kui-space-20;
  }

  .toolbar-divider {
    background-color: $kui-color-border;
    height: 16px;
    margin: 0 $kui-space-20;
    width: 2px;
  }
}
</style>
