<template>
  <div class="markdown-ui-toolbar">
    <div class="toolbar-left">
      <div
        v-if="editable && mode !== 'read'"
        class="button-group"
      >
        <button
          :class="{ 'active': mode === 'edit' }"
          :disabled="mode === 'edit'"
          @mousedown.prevent="changeMode('edit')"
        >
          Edit
        </button>
        <button
          :class="{ 'active': mode === 'split' }"
          @mousedown.prevent="changeMode('split')"
        >
          Split
        </button>
        <button
          :class="{ 'active': mode === 'preview' }"
          @mousedown.prevent="changeMode('preview')"
        >
          Preview
        </button>
      </div>

      <template v-if="editable && mode !== 'read'">
        <div class="toolbar-divider" />

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
      </template>

      <div
        v-if="mode !== 'read'"
        class="toolbar-divider"
      />

      <button
        v-if="mode !== 'read'"
        data-testid="toggle-fullscreen"
        @mousedown.prevent="emit('toggle-fullscreen')"
      >
        Toggle Fullscreen
      </button>
      <button
        v-if="['split', 'preview'].includes(mode)"
        data-testid="toggle-html-preview"
        @mousedown.prevent="emit('toggle-html-preview')"
      >
        Toggle HTML Preview
      </button>
    </div>
    <div class="toolbar-right">
      <template v-if="editable && mode === 'read'">
        <button
          data-testid="edit"
          @click="determineEditMode"
        >
          Edit
        </button>
      </template>
      <template
        v-if="editable && ['edit', 'split', 'preview'].includes(mode)"
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
import { useActiveElement, useMediaQuery } from '@vueuse/core'
import { TOOLBAR_HEIGHT } from '../constants'
import { KUI_BREAKPOINT_TABLET } from '@kong/design-tokens'
import type { MarkdownMode, FormatOption, TemplateOption, InlineFormat, MarkdownTemplate } from '../types'

const textareaId: Ref<string> = inject(TEXTAREA_ID, ref(''))
const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('read'))
const editable: Ref<boolean> = inject(EDITABLE_INJECTION_KEY, ref(false))

const emit = defineEmits<{
  (e: 'format-selection', format: InlineFormat): void
  (e: 'insert-template', format: MarkdownTemplate): void
  (e: 'change-mode', mode: MarkdownMode): void
  (e: 'toggle-html-preview'): void
  (e: 'toggle-fullscreen'): void
  (e: 'cancel'): void
  (e: 'save'): void
}>()

// The document.activeElement
const activeElement = useActiveElement()
const textareaIsActive = computed((): boolean => activeElement.value?.id === textareaId.value)

const determineEditMode = (): void => {
  // Determine if the user is on a wider viewport
  const isWideScreen = useMediaQuery(`(min-width: ${KUI_BREAKPOINT_TABLET})`)
  // If yes, enter `split` mode, otherwise `edit` mode
  changeMode(isWideScreen.value ? 'split' : 'edit')
}

const changeMode = (newMode: MarkdownMode): void => {
  if (mode.value !== newMode) {
    emit('change-mode', newMode)
  }
}

const cancelEdit = (): void => {
  emit('cancel')
  changeMode('read')
}

const saveChanges = (): void => {
  emit('save')
  changeMode('read')
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

  button {
    cursor: pointer;
    white-space: nowrap;
  }

  .button-group {
    align-items: center;
    display: flex;

    button {
      border: 0;
      border-right: 1px solid $kui-color-border;
      padding: $kui-space-20 $kui-space-30;

      &:disabled {
        cursor: not-allowed;
      }

      &:last-of-type {
        border-right: 0;
      }

      &.active {
        background: $kui-color-background-primary;
        color: $kui-color-text-inverse;
      }
    }
  }

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
