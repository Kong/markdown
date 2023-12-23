<template>
  <div
    v-if="ready"
    :id="componentContainerId"
    class="kong-ui-public-markdown-ui"
    :class="[`mode-${currentMode}`, { 'fullscreen': isFullscreen }]"
  >
    <MarkdownToolbar
      @cancel="cancelChanges"
      @change-mode="(mode: MarkdownMode) => currentMode = mode"
      @format-selection="formatSelection"
      @insert-template="insertTemplate"
      @save="saveChanges"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-html-preview="toggleHtmlPreview"
    />
    <div class="markdown-panes">
      <div
        v-if="editable && (['edit', 'split'].includes(currentMode))"
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
          @input="$event => onContentEdit($event as any)"
        />
      </div>
      <div
        v-if="['read', 'preview', 'split'].includes(currentMode)"
        class="markdown-preview"
        :class="[scrollableClass]"
        data-testid="markdown-preview"
      >
        <div
          class="markdown-content-container"
          data-testid="markdown-content-container"
        >
          <MarkdownContent :content="htmlPreview ? markdownPreviewHtml : markdownHtml" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, computed, ref, nextTick, provide, watch, watchEffect } from 'vue'
import type { PropType } from 'vue'
import MarkdownToolbar from '@/components/toolbar/MarkdownToolbar.vue'
import MarkdownContent from '@/components/MarkdownContent.vue'
import composables from '@/composables'
import { TEXTAREA_ID_INJECTION_KEY, MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY } from '@/injection-keys'
import { EDITOR_DEBOUNCE_TIMEOUT, TOOLBAR_HEIGHT, NEW_LINE_CHARACTER } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import type { MarkdownMode, InlineFormat, MarkdownTemplate, TextAreaInputEvent } from '@/types'
import formatHtml from 'html-format'
import { KUI_FONT_FAMILY_TEXT, KUI_FONT_FAMILY_CODE } from '@kong/design-tokens'
import MermaidJs from 'mermaid'

const props = defineProps({
  /** The markdown content */
  modelValue: {
    type: String,
    default: '',
  },
  /** The mode used when the component initializes, one of 'read', 'edit', 'split', 'preview' */
  mode: {
    type: String as PropType<MarkdownMode>,
    default: 'read',
    validator: (mode: string): boolean => ['read', 'edit', 'split', 'preview'].includes(mode),
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
    validator: (size: number): boolean => size >= 2 && size <= 6,
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
    validator: (theme: string): boolean => ['light', 'dark'].includes(theme),
  },
  /** The max height of the editor when not being displayed fullscreen. Defaults to 300, Minimum of 100. */
  editorMaxHeight: {
    type: Number,
    default: 300,
    validator: (height: number): boolean => height >= 100,
  },
  /** When the editor is in fullscreen, the top offset, in pixels */
  fullscreenOffsetTop: {
    type: Number,
    default: 0,
  },
  /** The z-index of the position:fixed container when in fullscreen. */
  fullscreenZIndex: {
    type: Number,
    default: 1001,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', rawMarkdown: string): void
  (e: 'mode', mode: MarkdownMode): void
  (e: 'fullscreen', active: boolean): void
  (e: 'save', rawMarkdown: string): void
  (e: 'cancel'): void
}>()

const { init: initMarkdownIt, md } = composables.useMarkdownIt(props.theme)

// Generate a unique id to handle mutiple components on the same page
const uniqueId = uuidv4()
const componentContainerId = computed((): string => `markdown-ui-${uniqueId}`)
const textareaId = computed((): string => `markdown-ui-textarea-${uniqueId}`)
const scrollableClass = computed((): string => `scrollable-${uniqueId}`)
const tabSize = computed((): number => props.tabSize)

// Provide values to child components
provide(TEXTAREA_ID_INJECTION_KEY, computed((): string => textareaId.value))
provide(MODE_INJECTION_KEY, computed((): MarkdownMode => currentMode.value))
provide(EDITABLE_INJECTION_KEY, computed((): boolean => props.editable))
provide(FULLSCREEN_INJECTION_KEY, computed((): boolean => isFullscreen.value))
provide(HTML_PREVIEW_INJECTION_KEY, computed((): boolean => htmlPreview.value))

const { debounce } = composables.useDebounce()
const ready = ref<boolean>(false)
// Set the currentMode when the component mounts.
// props.editable will override the `props.mode`
const currentMode = ref<MarkdownMode>(['edit', 'split', 'preview'].includes(props.mode) && props.editable ? props.mode : 'read')

const { initializeSyncScroll, destroySyncScroll } = composables.useSyncScroll(scrollableClass)

// Reinitialize the scroll syncing when the mode changes
watch(currentMode, async (mode: MarkdownMode): Promise<void> => {
  switch (mode) {
    case 'edit':
      htmlPreview.value = false
      break
    case 'split':
      // Still emit `edit` event here - split mode is just another form of editing
      break
    case 'preview':
      break
    case 'read':
      htmlPreview.value = false
      isFullscreen.value = false
      break
  }

  // Emit the changed mode
  emit('mode', mode)

  destroySyncScroll()
  await nextTick()
  // Re-synchronize the scroll containers
  initializeSyncScroll()
})

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

/** When true, show the HTML preview instead of the rendered markdown preview */
const htmlPreview = ref<boolean>(false)

// If the htmlPreview is enabled, pass the generated HTML through the markdown renderer and output the syntax-highlighted result
watchEffect(() => {
  if (htmlPreview.value) {
    markdownPreviewHtml.value = md.value?.render('```html' + NEW_LINE_CHARACTER + formatHtml(markdownHtml.value, ' '.repeat(tabSize.value)) + NEW_LINE_CHARACTER + '```')
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

/** Copy the contents of the code block to the clipboard */
const copyCodeBlock = async (e: any): Promise<void> => {
  try {
    e.preventDefault()
    if (navigator?.clipboard?.writeText) {
      const copyText = e.target?.dataset?.copytext || ''
      if (copyText) {
        await navigator.clipboard.writeText(copyText)
        e?.target?.blur()
      }
    }
  } catch (err) {
    console.warn('Could not copy text to clipboard', err)
  }
}

// When the textarea `input` event is triggered, or "faked" by other editor methods, update the Vue refs and rendered markdown
const onContentEdit = (event: TextAreaInputEvent, emitEvent = true): void => {
  // Update the ref immediately
  rawMarkdown.value = event.target.value

  // Debounce the update for the UI
  debouncedUpdateContent(emitEvent)
}

const debouncedUpdateContent = debounce(async (emitEvent = true): Promise<void> => {
  // Update the output
  markdownHtml.value = getHtmlFromMarkdown(rawMarkdown.value)

  await nextTick() // **MUST** await nextTick for the virtual DOM to refresh again

  updateCodeCopyClickEvents(true)

  // Emit the updated content if `emitEvent` is not false
  if (emitEvent) {
    emit('update:modelValue', rawMarkdown.value)
  }

  // Re-render any `.mermaid` containers
  await nextTick() // **MUST** await nextTick for the virtual DOM to refresh

  await updateMermaid()
}, EDITOR_DEBOUNCE_TIMEOUT)

const updateCodeCopyClickEvents = (enable = true): void => {
  // Bind click events to code copy blocks
  Array.from([...document.querySelectorAll(`#${componentContainerId.value} .kong-markdown-code-block-copy[data-copytext]`)]).forEach((el: Element) => {
    if (enable) {
      el.removeEventListener('click', copyCodeBlock)
      el.addEventListener('click', copyCodeBlock)
    } else {
      el.removeEventListener('click', copyCodeBlock)
    }
  })
}

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

  updateCodeCopyClickEvents(true)
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

// Emit an event when fullscreen mode is toggled
watch(isFullscreen, (active: boolean): void => {
  emit('fullscreen', active)
})

// Handle the user clicking the `cancel` button
const cancelChanges = (): void => {
  emit('cancel')
}

// Handle the user clicking the `save` button
const saveChanges = (): void => {
  emit('save', rawMarkdown.value)
}

// Initialize keyboard shortcuts; they will only fire in edit mode when the textarea is active
composables.useKeyboardShortcuts(textareaId.value, rawMarkdown, tabSize, emulateInputEvent)

onBeforeMount(async () => {
  // Initialize markdown-it
  await initMarkdownIt()

  // Render the markdown
  markdownHtml.value = getHtmlFromMarkdown(props.modelValue)

  await nextTick()
  await updateMermaid()
})

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

  if (currentMode.value === 'split') {
    await nextTick()
    // Synchronize the scroll containers
    initializeSyncScroll()
  }
})

onUnmounted(() => {
  // Remove scrolling event listeners
  destroySyncScroll()

  // Unbind click events
  updateCodeCopyClickEvents(false)
})

// Calculate the max height of the `.markdown-panes` when fullscreen is true. 100vh, minus the toolbar height, minus 10px padding.
const fullscreenMarkdownPanesHeight = computed((): string => `calc(100vh - ${TOOLBAR_HEIGHT} - 10px)`)
const markdownEditorMaxHeight = computed((): string => `${props.editorMaxHeight}px`)
</script>

<style lang="scss" scoped>
.kong-ui-public-markdown-ui {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: $kui-breakpoint-phablet) {
    gap: var(--kui-space-0, $kui-space-0);
  }

  .markdown-panes {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--kui-space-40, $kui-space-40);
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      flex-direction: row;
    }
  }

  &.mode-edit,
  &.mode-split {
    .markdown-panes {
      height: v-bind('markdownEditorMaxHeight'); // max-height in edit and split modes
    }
  }

  &.mode-edit,
  &.mode-split,
  &.mode-preview {

    // Fullscreen mode only available when editing
    &.fullscreen {
      background: var(--kui-color-background, $kui-color-background);
      bottom: 0;
      height: 100%;
      left: 0;
      margin-top: v-bind('fullscreenOffsetTop');
      padding: var(--kui-space-0, $kui-space-0) var(--kui-space-40, $kui-space-40) var(--kui-space-40, $kui-space-40);
      position: fixed;
      right: 0;
      top: 0;
      width: 100%;
      z-index: v-bind('$props.fullscreenZIndex');

      .markdown-panes {
        height: v-bind('fullscreenMarkdownPanesHeight');
      }
    }

    .markdown-panes {
      .markdown-preview {
        border: $kui-border-width-10 solid $kui-color-border;
        border-radius: var(--kui-border-radius-30, $kui-border-radius-30);
        // Hide the preview in edit mode on small screens
        display: none;

        @media (min-width: $kui-breakpoint-phablet) {
          display: flex;
        }
      }
    }
  }

  .markdown-editor,
  .markdown-preview {
    display: flex;
    flex: 1; // Each column takes up equal width
    flex-direction: column;
    overflow-y: auto;
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      width: 50%;
    }
  }

  .markdown-preview {
    background-color: var(--kui-color-background, $kui-color-background);
    box-sizing: border-box; // Ensure the padding is calculated in the element's width
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
    max-width: 100%;
    outline: none;
    padding: var(--kui-space-40, $kui-space-40) var(--kui-space-50, $kui-space-50);
    resize: none;
    text-wrap: wrap;
    transition: box-shadow 0.2s ease-in-out;
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      font-size: var(--kui-font-size-30, $kui-font-size-30);
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
