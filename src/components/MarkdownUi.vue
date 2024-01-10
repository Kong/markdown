<template>
  <div
    :id="componentContainerId"
    ref="markdownComponent"
    class="kong-ui-public-markdown-ui"
    :class="[`mode-${currentMode}`, `theme-${activeTheme}`, { 'fullscreen': isFullscreen }]"
    data-testid="markdown-ui"
  >
    <MarkdownToolbar
      v-if="editable && currentMode !== 'read'"
      @change-mode="(mode: MarkdownMode) => currentMode = mode"
      @format-selection="formatSelection"
      @insert-template="insertTemplate"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-html-preview="toggleHtmlPreview"
    >
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
      <template #editor-actions>
        <slot
          :cancel="cancel"
          name="editor-actions"
          :save="save"
        >
          <template
            v-if="editable && ['edit', 'split', 'preview'].includes(currentMode)"
          >
            <ToolbarButton
              data-testid="cancel"
              :icon="false"
              :tabindex="0"
              @click="cancel"
            >
              Cancel
            </ToolbarButton>
            <ToolbarButton
              appearance="primary"
              data-testid="save"
              :icon="false"
              :tabindex="0"
              @click="save"
            >
              Save
            </ToolbarButton>
          </template>
        </slot>
      </template>
    </MarkdownToolbar>

    <div class="markdown-panes">
      <div
        v-if="editable && (['edit', 'split'].includes(currentMode))"
        class="markdown-editor"
        data-testid="markdown-editor"
      >
        <textarea
          :id="textareaId"
          ref="textarea"
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
          <div class="content-buttons">
            <div
              v-if="currentMode === 'read' && !!rawMarkdown?.length && downloadable"
              class="download-button"
            >
              <slot
                :download="download"
                name="download"
              >
                <ToolbarButton
                  appearance="primary"
                  aria-label="Download markdown document"
                  data-testid="download"
                  :icon="false"
                  :tabindex="0"
                  @click="download"
                >
                  <DownloadIcon
                    decorative
                    :size="KUI_ICON_SIZE_30"
                  />
                  <span class="content-button-text">Download</span>
                </ToolbarButton>
              </slot>
            </div>
            <div
              v-if="currentMode === 'read' && editable"
              class="edit-button"
            >
              <slot
                :edit="edit"
                name="edit"
              >
                <ToolbarButton
                  appearance="primary"
                  aria-label="Edit markdown document"
                  data-testid="edit"
                  :icon="false"
                  :tabindex="0"
                  @click="edit"
                >
                  <EditIcon
                    decorative
                    :size="KUI_ICON_SIZE_30"
                  />
                  <span class="content-button-text">Edit</span>
                </ToolbarButton>
              </slot>
            </div>
          </div>
          <MarkdownContent
            :class="{ 'html-preview': htmlPreview }"
            :content="htmlPreview ? markdownPreviewHtml : markdownHtml"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick, provide, watch, watchEffect } from 'vue'
import type { PropType } from 'vue'
import MarkdownToolbar from '@/components/toolbar/MarkdownToolbar.vue'
import MarkdownContent from '@/components/MarkdownContent.vue'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import composables from '@/composables'
import { UNIQUE_ID_INJECTION_KEY, TEXTAREA_ID_INJECTION_KEY, MODE_INJECTION_KEY, EDITABLE_INJECTION_KEY, FULLSCREEN_INJECTION_KEY, HTML_PREVIEW_INJECTION_KEY, THEME_INJECTION_KEY } from '@/injection-keys'
import { EDITOR_DEBOUNCE_TIMEOUT, TOOLBAR_HEIGHT, NEW_LINE_CHARACTER } from '@/constants'
import { useMediaQuery, useEventListener, usePreferredColorScheme } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import type { MarkdownMode, InlineFormat, MarkdownTemplate, TextAreaInputEvent, Theme } from '@/types'
import formatHtml from 'html-format'
import { KUI_FONT_FAMILY_TEXT, KUI_FONT_FAMILY_CODE, KUI_SPACE_60, KUI_BREAKPOINT_PHABLET, KUI_ICON_SIZE_30 } from '@kong/design-tokens'
import { EditIcon, DownloadIcon } from '@kong/icons'
import MermaidJs from 'mermaid'

const props = defineProps({
  /** The markdown content */
  modelValue: {
    type: String,
    default: '',
  },
  /** Is the markdown document able to be edited by the user. Defaults to `false`. */
  editable: {
    type: Boolean,
    default: false,
  },
  /** Is the markdown document able to be edited by the user. Defaults to `false`. */
  downloadable: {
    type: Boolean,
    default: false,
  },
  /** The markdown document filename used when downloaded. */
  filename: {
    type: String,
    default: 'document',
  },
  /** The mode used when the component initializes, one of 'read', 'edit', 'split', 'preview' */
  mode: {
    type: String as PropType<MarkdownMode>,
    default: 'read',
    validator: (mode: string): boolean => ['read', 'edit', 'split', 'preview'].includes(mode),
  },
  /** The number of spaces to insert on tab. Defaults to 2, max of 6 */
  tabSize: {
    type: Number,
    default: 2,
    validator: (size: number): boolean => size >= 2 && size <= 6,
  },
  /** The theme used when the component initializes, one of 'light' or 'dark'. Defaults to the user's browser's preferred color scheme. */
  theme: {
    type: String as PropType<Theme>,
    default: '',
    validator: (theme: string): boolean => ['', 'light', 'dark'].includes(theme),
  },
  /** The max height of the component when not being displayed fullscreen. Defaults to 300, Minimum of 100. */
  maxHeight: {
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
  (e: 'save', rawMarkdown: string): void
  (e: 'cancel'): void
  (e: 'mode', mode: MarkdownMode): void
  (e: 'fullscreen', active: boolean): void
}>()

// Initialize template refs
const textarea = ref<HTMLTextAreaElement | null>(null)
const markdownComponent = ref<HTMLDivElement | null>(null)

const { init: initMarkdownIt, md } = composables.useMarkdownIt()

// Generate a unique id to handle mutiple components on the same page
const uniqueId = uuidv4()
// Bind the unique ids to differentiate between potential multiple components on a page
const componentContainerId = computed((): string => `markdown-ui-${uniqueId}`)
const textareaId = computed((): string => `markdown-ui-textarea-${uniqueId}`)
const scrollableClass = computed((): string => `scrollable-${uniqueId}`)
const tabSize = computed((): number => props.tabSize)

const preferredColorScheme = usePreferredColorScheme()
// Set the active theme from props.theme if set; otherwise use the user's browser's preferred color scheme
const activeTheme = ref<Theme>(props.theme ? props.theme : (preferredColorScheme.value === 'dark' ? preferredColorScheme.value : 'light'))

// Provide values to child components
provide(UNIQUE_ID_INJECTION_KEY, computed((): string => uniqueId))
provide(TEXTAREA_ID_INJECTION_KEY, computed((): string => textareaId.value))
provide(MODE_INJECTION_KEY, computed((): MarkdownMode => currentMode.value))
provide(EDITABLE_INJECTION_KEY, computed((): boolean => props.editable))
provide(FULLSCREEN_INJECTION_KEY, computed((): boolean => isFullscreen.value))
provide(THEME_INJECTION_KEY, computed((): Theme => activeTheme.value))
provide(HTML_PREVIEW_INJECTION_KEY, computed((): boolean => htmlPreview.value))

// Set the currentMode when the component mounts.
// props.editable will override the `props.mode`
const currentMode = ref<MarkdownMode>(['edit', 'split', 'preview'].includes(props.mode) && props.editable ? props.mode : 'read')

const { initializeSyncScroll, destroySyncScroll } = composables.useSyncScroll(scrollableClass)
const { debounce } = composables.useDebounce()

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

  // Re-render any `.mermaid` containers
  await updateMermaid()

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

const { toggleInlineFormatting, insertMarkdownTemplate, insertLink } = composables.useMarkdownActions(textarea, rawMarkdown)

// When the user toggles inline formatting
const formatSelection = (format: InlineFormat): void => {
  if (format === 'link') {
    insertLink()
  } else {
    toggleInlineFormatting(format)
  }
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
watchEffect((): void => {
  if (htmlPreview.value) {
    markdownPreviewHtml.value = md.value?.render('```html' + NEW_LINE_CHARACTER + formatHtml(markdownHtml.value, ' '.repeat(tabSize.value)) + NEW_LINE_CHARACTER + '```')
  }
})

const updateMermaid = async (): Promise<void> => {
  if (typeof MermaidJs !== 'undefined' && typeof MermaidJs?.run === 'function') {
    // Scope the query selector to this instance of the markdown component (unique container id)
    const mermaidNodes = `#${componentContainerId.value} .markdown-content-container .mermaid`
    if (document.querySelector(mermaidNodes)) {
      await MermaidJs.run({
        querySelector: mermaidNodes,
        suppressErrors: true,
      })
    }
  }
}

const download = (): void => {
  try {
    const blob = new Blob([rawMarkdown.value], { type: 'text/markdown;charset=utf-8' })
    const data = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = data
    link.download = `${props.filename.replace(/ /g, '-').replace(/[^-+.a-zA-Z0-9_]/g, '').replace(/(\.md)+$/g, '')}.md`

    // link.click() doesn't work in Firefox
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    )
    // For Firefox it is necessary to delay revoking the ObjectURL
    setTimeout(() => {
      window.URL.revokeObjectURL(data)
      link.remove()
    }, 100)

  } catch (err) {
    console.warn('download', err)
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

  // Emit the updated content if `emitEvent` is not false
  if (emitEvent) {
    emit('update:modelValue', rawMarkdown.value)
  }

  await nextTick() // **MUST** await nextTick for the virtual DOM to refresh

  // Re-render any `.mermaid` containers
  await updateMermaid()
}, EDITOR_DEBOUNCE_TIMEOUT)

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

// Emit an event when fullscreen mode is toggled
watch(isFullscreen, (active: boolean): void => {
  emit('fullscreen', active)
})

// Determine if the user is on a wider viewport
const isPhabletWidth = useMediaQuery(`(min-width: ${KUI_BREAKPOINT_PHABLET})`)

const edit = (): void => {
  // If isPhabletWidth, enter `split` mode, otherwise `edit` mode
  currentMode.value = isPhabletWidth.value ? 'split' : 'edit'
}

// Handle the user clicking the `cancel` button
const cancel = (): void => {
  emit('cancel')
  currentMode.value = 'read'
}

// Handle the user clicking the `save` button
const save = (): void => {
  emit('save', rawMarkdown.value)
  currentMode.value = 'read'
}

const initializeMermaid = (): void => {
  if (typeof MermaidJs !== 'undefined' && typeof MermaidJs?.initialize === 'function') {
    MermaidJs?.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      fontFamily: KUI_FONT_FAMILY_TEXT,
      altFontFamily: KUI_FONT_FAMILY_CODE,
      theme: activeTheme.value === 'light' ? 'default' : 'base',
    })
  }
}

watch(() => props.theme, async (theme: Theme) => {
  if (['light', 'dark'].includes(theme)) {
    // Update the ref
    activeTheme.value = theme
    // Update the Shikiji theme
    await initMarkdownIt(activeTheme.value)
    // Update the mermaid theme
    initializeMermaid()
    // Trigger a re-render
    emulateInputEvent()
  }
})

// Copy the contents of the code block to the clipboard
const copyCodeBlock = async (e: any): Promise<void> => {
  try {
    // If not a `.kong-markdown-code-block-copy[data-copytext]` element, exit early
    if (!e.target?.classList?.contains('kong-markdown-code-block-copy') || !e.target?.dataset?.copytext) {
      return
    }

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

// Initialize keyboard shortcuts; they will only fire in edit mode when the textarea is active
composables.useKeyboardShortcuts(textarea, rawMarkdown, tabSize, emulateInputEvent)

onMounted(async () => {
  // Initialize markdown-it
  await initMarkdownIt(activeTheme.value)
  // Render the markdown
  markdownHtml.value = getHtmlFromMarkdown(props.modelValue)

  // Await a DOM tick
  await nextTick()

  // bind code copy button click events
  useEventListener(markdownComponent, 'click', copyCodeBlock)

  initializeMermaid()
  await updateMermaid()

  if (currentMode.value === 'split') {
    await nextTick()
    // Synchronize the scroll containers
    initializeSyncScroll()
  }
})

onUnmounted(() => {
  // Remove scrolling event listeners
  destroySyncScroll()
})

// Calculate the max height of the `.markdown-panes` when fullscreen is true. 100vh, minus the toolbar height, minus 10px padding.
const fullscreenMarkdownPanesHeight = computed((): string => `calc(100vh - ${TOOLBAR_HEIGHT} - ${KUI_SPACE_60})`)
const markdownPanesMaxHeight = computed((): string => `${props.maxHeight}px`)
</script>

<style lang="scss" scoped>
.kong-ui-public-markdown-ui {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--kui-space-50, $kui-space-50);
  margin-bottom: var(--kui-space-70, $kui-space-70);
  padding-bottom: var(--kui-space-50, $kui-space-50);
  position: relative;
  width: 100%;

  .markdown-panes {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--kui-space-50, $kui-space-50);
    width: 100%;

    @media (min-width: $kui-breakpoint-phablet) {
      flex-direction: row;
    }
  }

  &.mode-edit,
  &.mode-split {
    .markdown-panes {
      height: v-bind('markdownPanesMaxHeight'); // max-height in edit and split modes
    }
  }

  &.mode-edit,
  &.mode-split,
  &.mode-preview {
    background-color: var(--kui-color-background-neutral-weakest, $kui-color-background-neutral-weakest);
    border-color: var(--kui-color-border, $kui-color-border);
    border-radius: var(--kui-border-radius-40, $kui-border-radius-40);
    border-style: solid;
    border-width: var(--kui-border-width-0, $kui-border-width-0) var(--kui-border-width-10, $kui-border-width-10) var(--kui-border-width-10, $kui-border-width-10) var(--kui-border-width-10, $kui-border-width-10);

    // Fullscreen mode only available when editing
    &.fullscreen {
      border-radius: var(--kui-border-radius-0, $kui-border-radius-0);
      bottom: 0;
      height: 100%;
      left: 0;
      margin-top: v-bind('fullscreenOffsetTop');
      position: fixed;
      right: 0;
      top: 0;
      width: 100%;
      z-index: v-bind('$props.fullscreenZIndex');

      .markdown-panes {
        height: v-bind('fullscreenMarkdownPanesHeight');
        padding-bottom: var(--kui-space-50, $kui-space-50);
      }

      .toolbar-overlay {
        &.left {
          border-top-left-radius: var(--kui-border-radius-0, $kui-border-radius-0);
        }

        &.right {
          border-top-right-radius: var(--kui-border-radius-0, $kui-border-radius-0);
        }
      }

      :deep(.markdown-ui-toolbar) {
        border-top-left-radius: var(--kui-border-radius-0, $kui-border-radius-0);
        border-top-right-radius: var(--kui-border-radius-0, $kui-border-radius-0);
      }
    }

    .markdown-panes {
      padding-left: var(--kui-space-50, $kui-space-50);
      padding-right: var(--kui-space-50, $kui-space-50);

      .markdown-preview {
        border: $kui-border-width-10 solid $kui-color-border;
        border-radius: var(--kui-border-radius-40, $kui-border-radius-40);
        // Hide the preview in edit mode on small screens
        display: none;

        @media (min-width: $kui-breakpoint-phablet) {
          display: flex;
        }
      }
    }
  }

  // Ensure split mode is never enabled below tablet
  &.mode-edit {
    .markdown-preview {
      @media (max-width: ($kui-breakpoint-tablet - 1px)) {
        display: none !important;
      }
    }
  }

  // Ensure split mode is never enabled below tablet
  &.mode-preview {
    .markdown-preview {
      @media (max-width: ($kui-breakpoint-tablet - 1px)) {
        display: flex !important;
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
    min-height: v-bind('TOOLBAR_HEIGHT');
    position: relative;

    @media (min-width: $kui-breakpoint-phablet) {
      padding-top: 0;
    }

    .content-buttons {
      align-items: center;
      display: flex;
      gap: var(--kui-space-20, $kui-space-20);
      justify-content: flex-end;
      position: absolute;
      right: 6px;
      top: 6px;

      .content-button-text {
        display: none;

        @media (min-width: $kui-breakpoint-mobile) {
          display: inline-block;
        }
      }
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
    border-radius: var(--kui-border-radius-40, $kui-border-radius-40);
    flex-direction: column;
  }

  textarea.markdown-editor-textarea {
    -webkit-appearance: none; // need this to allow box-shadow to apply on mobile
    appearance: none;
    background-color: var(--kui-color-background, $kui-color-background);
    border: 0;
    border-radius: var(--kui-border-radius-40, $kui-border-radius-40);
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

  // Dark theme styles
  &.theme-dark {
    :deep() {
      .download-button .toolbar-button,
      .edit-button .toolbar-button {
        background: var(--kui-color-background-transparent, $kui-color-background-transparent);
        border-color: var(--kui-color-border, $kui-color-border);
        color: var(--kui-color-text-inverse, $kui-color-text-inverse);

        &:hover {
          border-color: var(--kui-color-border, $kui-color-border);
        }
      }
    }
  }
}
</style>
