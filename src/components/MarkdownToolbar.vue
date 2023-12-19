<template>
  <div class="markdown-ui-toolbar">
    <div class="toolbar-left">
      <template v-if="mode === 'edit'">
        <button
          v-for="option in formatOptions"
          :key="option.label"
          :aria-label="option.label"
          :data-testid="`format-option-${option.action}`"
          :disabled="!textareaIsActive"
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
          :disabled="!textareaIsActive"
          @mousedown.prevent="emit('insert-template', option.action)"
        >
          {{ option.label }}
        </button>

        <div class="toolbar-divider" />

        <button
          data-testid="toggle-fullscreen"
          @mousedown.prevent="emit('toggle-fullscreen')"
        >
          Toggle Fullscreen
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
      <template v-if="editable && mode !== 'edit'">
        <button
          data-testid="edit"
          @click="toggleEditMode"
        >
          Edit
        </button>
      </template>
      <template
        v-if="editable && mode === 'edit'"
      >
        <button
          data-testid="cancel"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <button
          data-testid="save"
          @click="saveChanges"
        >
          Save
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { Ref } from 'vue'
import { TEXTAREA_ID, MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY } from '../injection-keys'
import { useActiveElement } from '@vueuse/core'
import { TOOLBAR_HEIGHT } from '../constants'
import type { MarkdownMode, FormatOption, TemplateOption, InlineFormat, MarkdownTemplate } from '../types'

const textareaId: Ref<string> = inject(TEXTAREA_ID, ref(''))
const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('view'))
const editable: Ref<boolean> = inject(EDITABLE_INJECTION_KEY, ref(false))

const emit = defineEmits<{
  (e: 'format-selection', format: InlineFormat): void
  (e: 'insert-template', format: MarkdownTemplate): void
  (e: 'toggle-editing', editing: boolean): void
  (e: 'toggle-html-preview'): void
  (e: 'toggle-fullscreen'): void
  (e: 'cancel'): void
  (e: 'save'): void
}>()

// The document.activeElement
const activeElement = useActiveElement()
const textareaIsActive = computed((): boolean => activeElement.value?.id === textareaId.value)

const toggleEditMode = (): void => {
  emit('toggle-editing', mode.value !== 'edit')
}

const cancelEdit = (): void => {
  emit('cancel')
  toggleEditMode()
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
  background-color: var(--kui-color-background, $kui-color-background);
  display: flex;
  gap: $kui-space-70;
  height: v-bind('TOOLBAR_HEIGHT');
  justify-content: space-between;
  overflow-x: auto;

  .toolbar-left,
  .toolbar-right {
    align-items: center;
    display: flex;
    gap: $kui-space-20;
    padding: $kui-space-40 $kui-space-0;
  }

  .toolbar-divider {
    background-color: $kui-color-border;
    height: 16px;
    margin: 0 $kui-space-20;
    width: 2px;
  }
}
</style>
