<template>
  <div
    ref="toolbar"
    class="markdown-ui-toolbar"
  >
    <div class="toolbar-left">
      <div
        v-if="editable && mode !== 'read'"
        class="button-group"
      >
        <button
          :class="{ 'active': mode === 'edit' }"
          :disabled="mode === 'edit'"
          :tabindex="0"
          @click.prevent="changeMode('edit')"
        >
          Edit
        </button>
        <button
          class="mode-split-button"
          :class="{ 'active': mode === 'split' }"
          :tabindex="0"
          @click.prevent="changeMode('split')"
        >
          Split
        </button>
        <button
          :class="{ 'active': mode === 'preview' }"
          :tabindex="0"
          @click.prevent="changeMode('preview')"
        >
          Preview
        </button>
      </div>

      <template v-if="editable && mode !== 'read'">
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
          <IconButton
            :aria-label="option.label"
            :data-testid="`format-option-${option.action}`"
            :tabindex="0"
            @click.prevent="emit('format-selection', option.action)"
          >
            <component
              :is="option.icon"
              class="button-icon"
              :size="KUI_ICON_SIZE_40"
            />
          </IconButton>
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
          <IconButton
            :aria-label="option.label"
            :data-testid="`template-option-${option.action}`"
            :tabindex="0"
            @click.prevent="emit('insert-template', option.action)"
          >
            <component
              :is="option.icon"
              class="button-icon"
              :size="KUI_ICON_SIZE_40"
            />
          </IconButton>
        </InfoTooltip>
      </template>

      <div
        v-if="mode !== 'read'"
        class="toolbar-divider"
      />

      <InfoTooltip
        v-if="mode !== 'read'"
        :data-testid="`tooltip-fullscreen`"
      >
        <template #tooltip>
          {{ fullscreen ? 'Exit fullscreen editor' : 'Enter fullscreen editor' }}
        </template>
        <IconButton
          :aria-label="fullscreen ? 'Exit fullscreen editor' : 'Enter fullscreen editor'"
          data-testid="toggle-fullscreen"
          :tabindex="0"
          @click.prevent="toggleFullscreen"
        >
          <component
            :is="fullscreen ? CollapseIcon : ExpandIcon"
            class="button-icon"
            :size="KUI_ICON_SIZE_40"
          />
        </IconButton>
      </InfoTooltip>

      <InfoTooltip
        v-if="['split', 'preview'].includes(mode)"
        :data-testid="`tooltip-fullscreen`"
      >
        <template #tooltip>
          {{ htmlPreview ? 'Toggle markdown Preview' : 'Toggle HTML Preview' }}
        </template>
        <IconButton
          :aria-label="htmlPreview ? 'Toggle markdown Preview' : 'Toggle HTML Preview'"
          data-testid="toggle-html-preview"
          :tabindex="0"
          @click.prevent="toggleHtmlPreview"
        >
          <component
            :is="htmlPreview ? MarkdownIcon : HtmlIcon"
            class="button-icon"
            :size="KUI_ICON_SIZE_40"
          />
        </IconButton>
      </InfoTooltip>
    </div>
    <div class="toolbar-right">
      <template v-if="editable && mode === 'read'">
        <button
          data-testid="edit"
          :tabindex="0"
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
          :tabindex="0"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <button
          data-testid="save"
          :tabindex="0"
          @click="saveChanges"
        >
          Save
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY } from '@/injection-keys'
import { useMediaQuery } from '@vueuse/core'
import { TOOLBAR_HEIGHT } from '@/constants'
import { KUI_BREAKPOINT_PHABLET, KUI_ICON_SIZE_40 } from '@kong/design-tokens'
import type { MarkdownMode, FormatOption, TemplateOption, InlineFormat, MarkdownTemplate } from '@/types'
import IconButton from '@/components/toolbar/IconButton.vue'
import InfoTooltip from '@/components/toolbar/InfoTooltip.vue'
import TooltipShortcut from '@/components/toolbar/TooltipShortcut.vue'
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, /* SubscriptIcon, SuperscriptIcon, MarkIcon, */ CodeIcon, CodeblockIcon, TableIcon, TasklistIcon, ListUnorderedIcon, ListOrderedIcon, MarkdownIcon, HtmlIcon, BlockquoteIcon, ExpandIcon, CollapseIcon } from '@kong/icons'

const mode: Ref<MarkdownMode> = inject(MODE_INJECTION_KEY, ref('read'))
const editable: Ref<boolean> = inject(EDITABLE_INJECTION_KEY, ref(false))
const fullscreen: Ref<boolean> = inject(FULLSCREEN_INJECTION_KEY, ref(false))
const htmlPreview: Ref<boolean> = inject(HTML_PREVIEW_INJECTION_KEY, ref(false))

const toolbar = ref<HTMLElement>()

const emit = defineEmits<{
  (e: 'format-selection', format: InlineFormat): void
  (e: 'insert-template', format: MarkdownTemplate): void
  (e: 'change-mode', mode: MarkdownMode): void
  (e: 'toggle-html-preview'): void
  (e: 'toggle-fullscreen'): void
  (e: 'cancel'): void
  (e: 'save'): void
}>()

// Determine if the user is on a wider viewport
const isPhabletWidth = useMediaQuery(`(min-width: ${KUI_BREAKPOINT_PHABLET})`)

const determineEditMode = (): void => {
  // If yes, enter `split` mode, otherwise `edit` mode
  changeMode(isPhabletWidth.value ? 'split' : 'edit')
}

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

const cancelEdit = (): void => {
  emit('cancel')
  changeMode('read')
}

const saveChanges = (): void => {
  emit('save')
  changeMode('read')
}

const formatOptions: FormatOption[] = [
  { label: 'Bold', action: 'bold', keys: ['B'], icon: BoldIcon },
  { label: 'Italic', action: 'italic', keys: ['I'], icon: ItalicIcon },
  { label: 'Underline', action: 'underline', keys: ['U'], icon: UnderlineIcon },
  { label: 'Strikethrough', action: 'strikethrough', keys: ['Shift', 'X'], icon: StrikethroughIcon },
  // Hidden for now
  // { label: 'Subscript', action: 'subscript', icon: SubscriptIcon },
  // Hidden for now
  // { label: 'Superscript', action: 'superscript', icon: SuperscriptIcon },
  // Hidden for now
  // { label: 'Mark', action: 'mark', icon: MarkIcon },
  { label: 'Code', action: 'code', keys: ['Shift', 'C'], icon: CodeIcon },
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
  // Add a `mac` class to the container if on Mac (for shortcut icons)
  // @ts-ignore - property exists
  toolbar.value?.classList?.toggle('mac', /Mac|iPhone|iPod|iPad/i.test(navigator?.platform) || /macOS|Mac|iPhone|iPod|iPad/i.test(navigator?.userAgentData?.platform))

  // If the screen size decreases and the user is in `split` mode, turn on edit mode
  adjustSplitMode()
})
</script>

<style lang="scss" scoped>
.markdown-ui-toolbar {
  align-items: center;
  background-color: var(--kui-color-background, $kui-color-background);
  display: flex;
  gap: var(--kui-space-70, $kui-space-70);
  height: v-bind('TOOLBAR_HEIGHT');
  justify-content: space-between;
  // Allowing the toolbar to scroll horizontally will hide the keyboard shortcut tooltips
  // which is fine on mobile since keyboard nav isn't as relevant there.
  // overflow-x: auto; // TODO: Enable for horizontal scrolling

  // TODO: Replace with tabs
  .button-group {
    align-items: center;
    display: flex;

    button {
      border: 0;
      border-right: 1px solid $kui-color-border;
      cursor: pointer;
      padding: var(--kui-space-20, $kui-space-20) var(--kui-space-30, $kui-space-30);

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

  .mode-split-button {
    display: none;

    @media (min-width: $kui-breakpoint-phablet) {
      display: inline-block;
    }
  }

  .toolbar-left,
  .toolbar-right {
    align-items: center;
    display: flex;
    gap: var(--kui-space-20, $kui-space-20);
    padding: var(--kui-space-40, $kui-space-40) var(--kui-space-0, $kui-space-0);
  }

  .toolbar-divider {
    background-color: var(--kui-color-border, $kui-color-border);
    height: 16px;
    margin: var(--kui-space-0, $kui-space-0) var(--kui-space-20, $kui-space-20);
    width: 2px;
  }

  .button-icon {
    pointer-events: none;
  }
}
</style>
