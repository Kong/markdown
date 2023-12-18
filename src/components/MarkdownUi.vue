<template>
  <div
    v-if="ready"
    :id="componentContainerId"
    class="kong-ui-public-markdown-ui"
    :class="[`mode-${currentMode}`, { 'is-fullscreen': isFullscreen }]"
  >
    <MarkdownToolbar
      @cancel="cancelChanges"
      @format-selection="formatSelection"
      @insert-template="insertTemplate"
      @save="saveChanges"
      @toggle-editing="toggleEditing"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-html-preview="toggleHtmlPreview"
    />
    <div class="markdown-panes">
      <div
        v-if="editable && currentMode === 'edit'"
        class="markdown-editor"
        data-testid="markdown-editor"
      >
        <textarea
          :id="textareaId"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          class="markdown-editor-textarea"
          :class="[scrollableClass]"
          data-testid="markdown-editor-textarea"
          placeholder="Begin editing..."
          spellcheck="false"
          translate="no"
          :value="rawMarkdown"
          @input="debouncedContentEdit"
          @keydown.shift.tab.exact.prevent="onShiftTab"
          @keydown.tab.exact.prevent="onTab"
        />
      </div>
      <div
        class="markdown-preview"
        data-testid="markdown-preview"
      >
        <div
          class="markdown-content-container"
          data-testid="markdown-content-container"
        >
          <MarkdownContent
            :class="[scrollableClass]"
            :content="htmlPreview ? markdownPreviewHtml : markdownHtml"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, computed, ref, nextTick, provide, watch, watchEffect } from 'vue'
import type { PropType } from 'vue'
import MarkdownToolbar from './MarkdownToolbar.vue'
import MarkdownContent from './MarkdownContent.vue'
import composables from '../composables'
import { TEXTAREA_ID, MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY } from '../injection-keys'
import { EDITOR_DEBOUNCE_TIMEOUT, MIN_HEIGHT_MOBILE, MIN_HEIGHT_DESKTOP } from '../constants'
import { v4 as uuidv4 } from 'uuid'
import type { MarkdownMode, InlineFormat, MarkdownTemplate, TextAreaInputEvent } from '../types'
import formatHtml from 'html-format'
import { KUI_FONT_FAMILY_TEXT, KUI_FONT_FAMILY_CODE } from '@kong/design-tokens'
import MermaidJs from 'mermaid'

const props = defineProps({
  /** The markdown content */
  modelValue: {
    type: String,
    default: '',
  },
  /** The mode used when the component initializes */
  mode: {
    type: String as PropType<MarkdownMode>,
    default: 'view',
    validator: (mode: string):boolean => ['view', 'edit'].includes(mode),
  },
  /** Optionally show the markdown editor */
  editable: {
    type: Boolean,
    default: false,
  },
  /** The number of spaces to insert on tab. Defaults to 2, max of 10 */
  tabSize: {
    type: Number,
    default: 2,
    validator: (size: number): boolean => size >= 2 && size <= 10,
  },
  /** MermaidJs is heavy; allow it opting-out by passing false. Defaults to true. */
  mermaid: {
    type: Boolean,
    default: true,
  },
  /** The theme used when the component initializes, one of 'light' or 'dark'. Defaults to 'light' */
  theme: {
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
    validator: (theme: string):boolean => ['light', 'dark'].includes(theme),
  },
  /** When the editor is in fullscreen mode, the top offset, in pixels */
  fullscreenOffsetTop: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', rawMarkdown: string): void
  (e: 'edit'): void
  (e: 'save', rawMarkdown: string): void
  (e: 'cancel'): void
}>()

const { init: initMarkdownIt, md } = composables.useMarkdownIt(props.theme)

// Generate a unique id to handle mutiple components on the same page
const uniqueId = uuidv4()
const componentContainerId = computed((): string => `markdown-ui-${uniqueId}`)
const textareaId = computed((): string => `markdown-ui-textarea-${uniqueId}`)
const scrollableClass = computed((): string => `scrollable-${uniqueId}`)

// Provide values to child components
provide(TEXTAREA_ID, computed((): string => textareaId.value))
provide(MODE_INJECTION_KEY, computed((): MarkdownMode => currentMode.value))
provide(EDITABLE_INJECTION_KEY, computed((): boolean => props.editable))

const { debounce } = composables.useDebounce()
const ready = ref<boolean>(false)
// Set the currentMode when the component mounts.
// props.editable will override the `props.mode`
const currentMode = ref<'view' | 'edit'>(props.mode === 'edit' && props.editable ? props.mode : 'view')

// Get rendered markdown
const getHtmlFromMarkdown = (content: string): string => {
  return md.value?.render(content)
}

// Initialize a ref to store the KTextArea value with prop content
const rawMarkdown = ref<string>(props.modelValue)
// A ref to store the processed markdown output
const markdownHtml = ref<string>('')
// A ref to store the preview HTML (if user enables it in the toolbar)
const markdownPreviewHtml = ref<string>('')

const { toggleInlineFormatting, toggleTab, insertMarkdownTemplate } = composables.useMarkdownActions(textareaId.value, rawMarkdown)

// When the user toggles inline formatting
const formatSelection = (format: InlineFormat): void => {
  toggleInlineFormatting(format)
  // Emulate an `input` event to trigger an update
  emulateInputEvent()
}

// When the user clicks one of the insert template buttons
const insertTemplate = (template: MarkdownTemplate): void => {
  insertMarkdownTemplate(template)
  // Emulate an `input` event to trigger an update
  emulateInputEvent()
}

// When the user presses the `tab` key in the textarea
const onTab = (): void => {
  toggleTab('add', props.tabSize)
}

// When the user presses `shift + tab` keys in the textarea
const onShiftTab = (): void => {
  toggleTab('remove', props.tabSize)
}

// Toggle the current mode
const toggleEditing = (isEditing: boolean): void => {
  currentMode.value = isEditing ? 'edit' : 'view'
  if (isEditing) {
    emit('edit')
  } else {
    // Always exit fullscreen mode when not editing
    isFullscreen.value = false
  }
}

/** When true, show the HTML preview instead of the rendered markdown preview */
const htmlPreview = ref<boolean>(false)

// If the htmlPreview is enabled, pass the generated HTML through the markdown renderer and output the syntax-highlighted result
watchEffect(() => {
  if (htmlPreview.value) {
    markdownPreviewHtml.value = md.value?.render('```html\n' + formatHtml(markdownHtml.value, ' '.repeat(props.tabSize)) + '\n```')
  }
})

const updateMermaid = async () => {
  if (props.mermaid) {
    // Scope the query selector to this instance of the markdown component (unique container id)
    const mermaidNodes = `#${componentContainerId.value} .markdown-content-container .mermaid`
    if (typeof MermaidJs !== 'undefined' && typeof MermaidJs?.run === 'function' && document.querySelector(mermaidNodes)) {
      await MermaidJs.run({
        querySelector: mermaidNodes,
        suppressErrors: true,
      })
    }
  }
}

// When the textarea `input` event is triggered, or "faked" by other editor methods, update the Vue refs and rendered markdown
const onContentEdit = async (event: TextAreaInputEvent, emitEvent = true): Promise<void> => {
  // Update the ref
  rawMarkdown.value = event.target.value

  // Update the output
  markdownHtml.value = getHtmlFromMarkdown(rawMarkdown.value)

  // Emit the updated content if `emitEvent` is not false
  if (emitEvent) {
    emit('update:modelValue', rawMarkdown.value)
  }

  // Re-render any `.mermaid` containers
  await nextTick() // **MUST** await nextTick for the virtual DOM to refresh
  await updateMermaid()
}

// Call the `onContentEdit` method, debounced, since this is bound to the textarea element's input event
const debouncedContentEdit = debounce(async (event: TextAreaInputEvent): Promise<void> => onContentEdit(event), EDITOR_DEBOUNCE_TIMEOUT)

/**
 * Emulate an `input` event when injecting content into the textarea
 * @param {boolean} emitEvent Should the `onContentEdit` function emit the `update:modelValue` event. Should be false when this event is triggered by `props.modelValue` changes.
 */
const emulateInputEvent = (emitEvent = true): void => {
  const event: TextAreaInputEvent = {
    target: {
      value: rawMarkdown.value,
    },
  }

  // Trigger the update
  onContentEdit(event, emitEvent)
}

// Initialize rawMarkdown.value with the props.modelValue content
watch(() => props.modelValue, (input: string) => {
  rawMarkdown.value = input
  // Pass `false` only here since the host app is the one changing the value, meaning we don't need to emit an update event
  emulateInputEvent(false)
})

// Toggle previewing the markdown preview HTML
const toggleHtmlPreview = (): void => {
  htmlPreview.value = !htmlPreview.value
  // Emulate an input event to redraw diagrams
  emulateInputEvent()
}

// Toggle the fullscreen editor
const isFullscreen = ref<boolean>(false)
const fullscreenOffsetTop = computed((): string => `${props.fullscreenOffsetTop}px`)
const toggleFullscreen = (): void => {
  isFullscreen.value = !isFullscreen.value
}

// Handle the user clicking the `cancel` button
const cancelChanges = (): void => {
  emit('cancel')
}

// Handle the user clicking the `save` button
const saveChanges = (): void => {
  emit('save', rawMarkdown.value)
}

// Initialize keyboard shortcuts; they will only fire in edit mode when the textarea is active
composables.useKeyboardShortcuts(textareaId.value, rawMarkdown, emulateInputEvent)

onBeforeMount(async () => {
  // Initialize markdown-it
  await initMarkdownIt()

  // Render the markdown
  markdownHtml.value = getHtmlFromMarkdown(props.modelValue)

  await nextTick()
  await updateMermaid()
})

const { initializeSyncScroll, destroySyncScroll } = composables.useSyncScroll(scrollableClass)

onMounted(async () => {
  ready.value = true

  if (props.mermaid && typeof MermaidJs !== 'undefined' && typeof MermaidJs?.initialize === 'function') {
    MermaidJs?.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      fontFamily: KUI_FONT_FAMILY_TEXT,
      altFontFamily: KUI_FONT_FAMILY_CODE,
      theme: props.theme === 'light' ? 'default' : 'dark',
    })
  }

  // Must await to let virtual DOM cycle
  await nextTick()

  // Syncronize container scrolling
  initializeSyncScroll()
})

onUnmounted(() => {
  // Remove scrolling event listeners
  destroySyncScroll()
})
</script>

<style lang="scss" scoped>
.kong-ui-public-markdown-ui {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: $kui-breakpoint-phablet) {
    gap: $kui-space-0;
  }

  .markdown-panes {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: $kui-space-70;
    padding: $kui-space-30;
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      flex-direction: row;
    }
  }

  &.mode-edit {
    // Fullscreen mode only available when editing
    &.is-fullscreen {
      background: var(--kui-color-background, $kui-color-background);
      bottom: 0;
      height: 100%;
      left: 0;
      margin-top: v-bind('fullscreenOffsetTop');
      overflow: auto;
      position: fixed;
      right: 0;
      top: 0;
      width: 100%;
      z-index: 1001;

      :deep(.markdown-content) {
        max-height: calc(100vh - 50px); // TODO: enable/disable for a scrollable container
      }
    }

    .markdown-panes {
      .markdown-preview {
        // Hide the preview in edit mode on small screens
        display: none;

        @media (min-width: $kui-breakpoint-phablet) {
          display: block;
        }
      }
    }
  }

  .markdown-editor,
  .markdown-preview {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      width: 50%;
    }
  }

  .markdown-html-preview {
    :deep(pre) {
      font-family: $kui-font-family-code;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  }

  .markdown-editor {
    flex-direction: column;
  }

  textarea.markdown-editor-textarea {
    -webkit-appearance: none; // need this to allow box-shadow to apply on mobile
    appearance: none;
    background-color: var(--kui-color-background, $kui-color-background);
    border: 0;
    border-radius: var(--kui-border-radius-30, $kui-border-radius-30);
    box-shadow: var(--kui-shadow-border, $kui-shadow-border); // Ensure the padding is calculated in the element's width
    box-sizing: border-box; // Ensure the padding is calculated in the element's width
    color: var(--kui-color-text, $kui-color-text);
    cursor: text;
    display: block;
    flex: 1;
    font-family: var(--kui-font-family-code, $kui-font-family-code);
    font-size: var(--kui-font-size-40, $kui-font-size-40); // needs to be at least 16px to prevent automatic zoom in on focus on mobile
    font-weight: var(--kui-font-weight-regular, $kui-font-weight-regular);
    line-height: var(--kui-line-height-40, $kui-line-height-40);
    max-height: calc(100vh - (#{$kui-space-70} * 2));
    max-width: 100%;
    min-height: v-bind('MIN_HEIGHT_MOBILE');
    outline: none;
    padding: var(--kui-space-40, $kui-space-40) var(--kui-space-50, $kui-space-50);
    resize: vertical;
    text-wrap: wrap;
    transition: box-shadow 0.2s ease-in-out;
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      font-size: var(--kui-font-size-30, $kui-font-size-30);
      min-height: v-bind('MIN_HEIGHT_DESKTOP');
    }

    &::placeholder {
      color: var(--kui-color-text-neutral, $kui-color-text-neutral);
    }

    &:hover {
      box-shadow: var(--kui-shadow-border-primary-weak, $kui-shadow-border-primary-weak);
    }

    &:focus {
      box-shadow: var(--kui-shadow-border-primary, $kui-shadow-border-primary), var(--kui-shadow-focus, $kui-shadow-focus);
    }

    &.error {
      box-shadow: var(--kui-shadow-border-danger, $kui-shadow-border-danger);

      &:hover {
        box-shadow: var(--kui-shadow-border-danger-strong, $kui-shadow-border-danger-strong);
      }

      &:focus {
        box-shadow: var(--kui-shadow-border-danger, $kui-shadow-border-danger), var(--kui-shadow-focus, $kui-shadow-focus);
      }
    }
  }
}
</style>
