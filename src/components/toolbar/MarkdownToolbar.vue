<template>
  <div
    v-if="editable && mode !== 'read'"
    ref="toolbar"
    class="markdown-ui-toolbar"
    :class="`theme-${activeTheme}`"
    data-testid="toolbar"
  >
    <div
      v-if="editable"
      class="toolbar-overlay left"
      :class="{ 'overlay-visible': !arrivedState.left }"
    />
    <div
      v-if="editable"
      class="toolbar-overlay right"
      :class="{ 'overlay-visible': !arrivedState.right }"
    />
    <div class="toolbar-left">
      <div
        class="button-group"
        role="radiogroup"
      >
        <label
          :id="`editor-mode-options-${uniqueId}`"
          class="sr-only"
        >Select the editor mode</label>
        <ToolbarButton
          :aria-checked="mode === 'edit'"
          :aria-labelledby="`editor-mode-options-${uniqueId}`"
          :class="['edit', { 'active': mode === 'edit' }]"
          data-testid="edit-mode-button"
          :disabled="mode === 'edit'"
          :icon="false"
          role="radio"
          type="button"
          @click.prevent="changeMode('edit')"
        >
          Edit
        </ToolbarButton>
        <ToolbarButton
          :aria-checked="mode === 'split'"
          :aria-labelledby="`editor-mode-options-${uniqueId}`"
          class="mode-split-button"
          :class="['split', { 'active': mode === 'split' }]"
          data-testid="split-mode-button"
          :disabled="mode === 'split'"
          :icon="false"
          role="radio"
          type="button"
          @click.prevent="changeMode('split')"
        >
          Split
        </ToolbarButton>
        <ToolbarButton
          :aria-checked="mode === 'preview'"
          :aria-labelledby="`editor-mode-options-${uniqueId}`"
          :class="['preview', { 'active': mode === 'preview' }]"
          data-testid="preview-mode-button"
          :disabled="mode === 'preview'"
          :icon="false"
          role="radio"
          type="button"
          @click.prevent="changeMode('preview')"
        >
          Preview
        </ToolbarButton>
      </div>

      <template v-if="editable && !['preview', 'read'].includes(mode)">
        <InfoTooltip
          v-for="option in formatOptions"
          :key="option.label"
          :data-testid="`tooltip-${option.action}`"
          :text-old="option.label"
        >
          <template #tooltip>
            <TooltipShortcut
              :keys="option.keys"
              :text="option.label"
            />
          </template>
          <ToolbarButton
            :aria-label="option.label"
            :data-testid="`format-option-${option.action}`"
            @click.prevent="emit('format-selection', option.action)"
          >
            <component
              :is="option.icon"
              class="button-icon"
              :size="KUI_ICON_SIZE_40"
            />
          </ToolbarButton>
        </InfoTooltip>

        <div class="toolbar-divider" />

        <InfoTooltip
          v-for="option in templateOptions"
          :key="option.label"
          :data-testid="`tooltip-${option.action}`"
        >
          <template #tooltip>
            {{ option.label }}
          </template>
          <ToolbarButton
            :aria-label="option.label"
            :data-testid="`template-option-${option.action}`"
            @click.prevent="emit('insert-template', option.action)"
          >
            <component
              :is="option.icon"
              class="button-icon"
              :size="KUI_ICON_SIZE_40"
            />
          </ToolbarButton>
        </InfoTooltip>
      </template>

      <div class="toolbar-divider" />

      <InfoTooltip :data-testid="`tooltip-fullscreen`">
        <template #tooltip>
          {{ fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
        </template>
        <ToolbarButton
          :aria-label="fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
          data-testid="toggle-fullscreen"
          @click.prevent="toggleFullscreen"
        >
          <component
            :is="fullscreen ? CollapseIcon : ExpandIcon"
            class="button-icon"
            :size="KUI_ICON_SIZE_40"
          />
        </ToolbarButton>
      </InfoTooltip>

      <InfoTooltip
        v-if="['split', 'preview'].includes(mode)"
        :data-testid="`tooltip-fullscreen`"
      >
        <template #tooltip>
          {{ htmlPreview ? 'Toggle markdown Preview' : 'Toggle HTML Preview' }}
        </template>
        <ToolbarButton
          :aria-label="htmlPreview ? 'Toggle markdown Preview' : 'Toggle HTML Preview'"
          data-testid="toggle-html-preview"
          @click.prevent="toggleHtmlPreview"
        >
          <component
            :is="htmlPreview ? MarkdownIcon : HtmlIcon"
            class="button-icon"
            :size="KUI_ICON_SIZE_40"
          />
        </ToolbarButton>
      </InfoTooltip>
    </div>
    <div
      v-if="$slots['toolbar-right']"
      class="toolbar-right"
      data-testid="slot-toolbar-right"
    >
      <slot name="toolbar-right" />
    </div>
    <div
      v-if="$slots['editor-actions']"
      class="editor-actions"
      data-testid="slot-editor-actions"
    >
      <slot name="editor-actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, THEME_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY, UNIQUE_ID_INJECTION_KEY } from '@/injection-keys'
import { useMediaQuery, useScroll } from '@vueuse/core'
import { TOOLBAR_HEIGHT } from '@/constants'
import { KUI_BREAKPOINT_PHABLET, KUI_ICON_SIZE_40 } from '@kong/design-tokens'
import type { MarkdownMode, FormatOption, TemplateOption, InlineFormat, MarkdownTemplate, Theme } from '@/types'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import InfoTooltip from '@/components/toolbar/InfoTooltip.vue'
import TooltipShortcut from '@/components/toolbar/TooltipShortcut.vue'
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, /* SubscriptIcon, SuperscriptIcon, MarkIcon, */ CodeIcon, LinkIcon, CodeblockIcon, TableIcon, TasklistIcon, ListUnorderedIcon, ListOrderedIcon, MarkdownIcon, HtmlIcon, BlockquoteIcon, ExpandIcon, CollapseIcon } from '@kong/icons'
import { v4 as uuidv4 } from 'uuid'

const uniqueId: Ref<String> = inject(UNIQUE_ID_INJECTION_KEY, ref(uuidv4()))
const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('read'))
const editable: Ref<boolean> = inject(EDITABLE_INJECTION_KEY, ref(false))
const activeTheme: Ref<Theme> = inject(THEME_INJECTION_KEY, ref('light'))
const fullscreen: Ref<boolean> = inject(FULLSCREEN_INJECTION_KEY, ref(false))
const htmlPreview: Ref<boolean> = inject(HTML_PREVIEW_INJECTION_KEY, ref(false))

const emit = defineEmits<{
  (e: 'format-selection', format: InlineFormat): void
  (e: 'insert-template', format: MarkdownTemplate): void
  (e: 'change-mode', mode: MarkdownMode): void
  (e: 'toggle-html-preview'): void
  (e: 'toggle-fullscreen'): void
}>()

const toolbar = ref<HTMLElement | null>(null)
// Track the scroll position of the toolbar to show/hide the `.toolbar-overlay`
const { arrivedState } = useScroll(toolbar)

// Determine if the user is on a wider viewport
const isPhabletWidth = useMediaQuery(`(min-width: ${KUI_BREAKPOINT_PHABLET})`)

// Verify the browser is wide enough to make `split` mode viable
const adjustSplitMode = (): void => {
  if (mode.value === 'split' && !isPhabletWidth.value) {
    changeMode('edit')
  }
}

// If the screen size decreases and the user is in `split` mode, turn on edit mode
watch(isPhabletWidth, (): void => {
  adjustSplitMode()
})

const changeMode = (newMode: MarkdownMode): void => {
  if (mode.value !== newMode) {
    emit('change-mode', newMode)
  }
}

const toggleFullscreen = (e: any): void => {
  emit('toggle-fullscreen')
  // Blur the button on click
  e?.target?.blur()
}

const toggleHtmlPreview = (e: any): void => {
  emit('toggle-html-preview')
  // Blur the button on click
  e?.target?.blur()
}

const formatOptions: FormatOption[] = [
  { label: 'Bold', action: 'bold', keys: ['B'], icon: BoldIcon },
  { label: 'Italic', action: 'italic', keys: ['I'], icon: ItalicIcon },
  { label: 'Underline', action: 'underline', keys: ['U'], icon: UnderlineIcon },
  { label: 'Strikethrough', action: 'strikethrough', keys: ['Shift', 'X'], icon: StrikethroughIcon },
  // { label: 'Subscript', action: 'subscript', icon: SubscriptIcon }, // Hidden for now
  // { label: 'Superscript', action: 'superscript', icon: SuperscriptIcon }, // Hidden for now
  // { label: 'Mark', action: 'mark', icon: MarkIcon }, // Hidden for now
  { label: 'Code', action: 'code', keys: ['Shift', 'C'], icon: CodeIcon },
  { label: 'Link', action: 'link', icon: LinkIcon },
]

const templateOptions: TemplateOption[] = [
  { label: 'Unordered List', action: 'unordered-list', icon: ListUnorderedIcon },
  { label: 'Ordered List', action: 'ordered-list', icon: ListOrderedIcon },
  { label: 'Tasklist', action: 'task', icon: TasklistIcon },
  { label: 'Codeblock', action: 'codeblock', icon: CodeblockIcon },
  { label: 'Table', action: 'table', icon: TableIcon },
  { label: 'Blockquote', action: 'blockquote', icon: BlockquoteIcon },
]

onMounted(() => {
  // If the screen size decreases and the user is in `split` mode, turn on edit mode
  adjustSplitMode()
})
</script>

<style lang="scss" scoped>
@import "../../assets/mixins";

.markdown-ui-toolbar {
  align-items: center;
  background-color: var(--kui-color-background-neutral-weakest, $kui-color-background-neutral-weakest);
  border-bottom: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
  border-top: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
  border-top-left-radius: var(--kui-border-radius-40, $kui-border-radius-40);
  border-top-right-radius: var(--kui-border-radius-40, $kui-border-radius-40);
  display: flex;
  gap: var(--kui-space-70, $kui-space-70);
  height: v-bind('TOOLBAR_HEIGHT');
  justify-content: space-between;
  min-height: v-bind('TOOLBAR_HEIGHT');
  padding-left: var(--kui-space-50, $kui-space-50);
  padding-right: var(--kui-space-50, $kui-space-50);

  // Allowing the toolbar to scroll horizontally will hide the keyboard shortcut tooltips
  // which is fine on mobile since keyboard nav isn't as relevant there, so we force the tooltip content to` display: none`
  @media (max-width: ($kui-breakpoint-phablet - 1px)) {
    overflow-x: auto; // TODO: Enable for horizontal scrolling

    :deep(.tooltip-content) {
      display: none !important;
    }
  }

  .button-group {
    align-items: center;
    display: flex;

    :deep(.toolbar-button) {
      border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);

      &.edit {
        border-bottom-right-radius: $kui-border-radius-0;
        border-top-right-radius: $kui-border-radius-0;
      }

      &.split {
        border-left: 0;
        border-radius: $kui-border-radius-0;
        border-right: 0;
      }

      &.preview {
        border-bottom-left-radius: $kui-border-radius-0;
        border-top-left-radius: $kui-border-radius-0;
      }

      &.active,
      &.active:hover {
        background: var(--kui-color-background-primary, $kui-color-background-primary);
        border-color: var(--kui-color-border-primary, $kui-color-border-primary);
        color: var(--kui-color-text-inverse, $kui-color-text-inverse);
        cursor: pointer;
      }
    }
  }

  .mode-split-button {
    display: none;

    @media (min-width: $kui-breakpoint-phablet) {
      display: inline-block;
    }
  }

  .toolbar-left,
  .toolbar-right,
  .editor-actions {
    align-items: center;
    display: flex;
    gap: var(--kui-space-20, $kui-space-20);
  }

  .toolbar-right {
    margin-left: auto;
  }

  .toolbar-divider {
    background-color: var(--kui-color-background-disabled, $kui-color-background-disabled);
    height: 16px;
    margin: var(--kui-space-0, $kui-space-0) var(--kui-space-20, $kui-space-20);
    width: 2px;
  }

  .button-icon {
    pointer-events: none;
  }

  // Dark theme styles
  &.theme-dark {
    background-color: var(--kui-color-background-neutral-strongest, $kui-color-background-neutral-strongest);
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-bottom-color: var(--kui-color-background-neutral, $kui-color-background-neutral);
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-top-color: var(--kui-color-background-neutral-strongest, $kui-color-background-neutral-strongest);

    .toolbar-divider {
      background-color: var(--kui-color-background-neutral-stronger, $kui-color-background-neutral-stronger);
    }

    :deep() {
      .toolbar-button {
        color: var(--kui-color-text-neutral-weak, $kui-color-text-neutral-weak);

        &:hover:not(:disabled):not(:focus):not(:active) {
          background-color: var(--kui-color-background-neutral-stronger, $kui-color-background-neutral-stronger);
          color: var(--kui-color-text-inverse, $kui-color-text-inverse);
        }

        &:focus {
          background-color: var(--kui-color-background-neutral-stronger, $kui-color-background-neutral-stronger);
          color: var(--kui-color-text-inverse, $kui-color-text-inverse);
        }

        &:active {
          background-color: var(--kui-color-background-neutral, $kui-color-background-neutral);
        }
      }

      .button-group .toolbar-button.active {
        border-color: var(--kui-color-border, $kui-color-border);
      }

      .tooltip-content {
        background-color: var(--kui-color-background-neutral-strongest, $kui-color-background-neutral-strongest);
        border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
      }
    }
  }
}

.toolbar-overlay {
  bottom: 0;
  content: '';
  display: none;
  height: calc(v-bind('TOOLBAR_HEIGHT') + 1px);
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 20px;

  // Show an overlay transparency while the toolbar is scrollable
  @media (max-width: ($kui-breakpoint-phablet - 1px)) {
    display: block;
  }

  &.left,
  &.right {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &.overlay-visible {
    opacity: 1;
  }

  &.left {
    background: linear-gradient(to right, rgba(#000, 0.1), rgba(#000, 0));
    border-top-left-radius: var(--kui-border-radius-40, $kui-border-radius-40);
    left: 0;
  }

  &.right {
    background: linear-gradient(to right, rgba(#000, 0), rgba(#000, 0.1));
    border-top-right-radius: var(--kui-border-radius-40, $kui-border-radius-40);
    right: 0;
  }
}

.sr-only {
  @include sr-only;
}
</style>
