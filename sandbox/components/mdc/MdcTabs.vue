<template>
  <div
    v-if="codeTabs.length"
    class="mdc-tabs"
  >
    <div>
      <div class="tabs-container">
        <div
          aria-orientation="horizontal"
          class="tab-list"
          role="tablist"
        >
          <button
            v-for="(tab, idx) of codeTabs"
            :id="`tab-button-${tab.key}`"
            :key="tab.key"
            :aria-controls="`tab-panel${uuidSuffix}`"
            :aria-selected="tab.active"
            class="tab-button"
            :class="{ 'active': tab.active }"
            role="tab"
            tabindex="0"
            type="button"
            @click="activateTab(tab.key)"
          >
            <span class="tab-title">{{ tab.title }}</span>
            <div
              v-if="tab.active"
              class="active-tab-border"
            />
            <div
              v-if="!tab.active"
              class="tab-not-active"
            />
            <div
              v-if="!tab.active && (idx === tabs.length - 1)"
              class="tab-not-active-not-last"
            />
          </button>
        </div>
        <div
          class="tab-filler"
          :class="{ 'is-rounded': !codeTabs.find(tab => tab.active)?.copyText}"
        >
          <div class="tab-filler-border" />
        </div>
        <button
          v-if="!!codeTabs.find(tab => tab.active)?.copyText"
          class="copy-button"
          type="button"
          @click="copyCode"
        >
          <KTooltip :text="copied ? 'Copied!' : 'Copy'">
            <CopyIcon :size="KUI_ICON_SIZE_40" />
          </KTooltip>
        </button>
      </div>
      <div class="tab-panel-container">
        <div
          :id="`tab-panel${uuidSuffix}`"
          :aria-labelledby="`tab-button-${activeTabKey}`"
          class="tab-panel"
          role="tabpanel"
          tabindex="0"
        >
          <div
            v-for="tab of codeTabs"
            :key="tab.key"
          >
            <slot
              v-if="tab.active"
              :name="getSlotName(tab.key)"
              unwrap="p"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
USAGE EXAMPLE
=====

::mdc-tabs
---
tabs:
  - key: mac
    title: Mac
    copyText: This is how you run the script on a Mac
  - key: windows
    title: Windows
    copyText: This is how you run the script on a Windows machine
---
#mac
```ts
This is how you run the script on a Mac
```

#windows
```ts
This is how you run the script on a Windows machine
```
::
*/
import { CopyIcon } from '@kong/icons'
import { KUI_ICON_SIZE_40 } from '@kong/design-tokens'
import { useClipboard } from '@vueuse/core'

interface Tab {
  key: string
  title: string
  active?: boolean
  copyText?: string
}

const uuidSuffix = `-${useId()}`

const props = defineProps({
  tabs: {
    type: Array as PropType<Tab[]>,
    default: () => [],
  },
})

const codeTabs = ref<Tab[]>([])

const getTabId = (key: string): string => {
  return `${key.toLocaleLowerCase().replace(/_/g, '-').replace(/[^a-z-]/g, '')}${uuidSuffix}`
}

const activeTabKey = computed((): string => codeTabs.value.find(tab => tab.active)?.key || '')

const activateTab = (key: string): void => {
  // If tab is already active, do nothing
  if (activeTabKey.value === key) {
    return
  }

  codeTabs.value.forEach((tab: Tab) => {
    tab.active = tab.key === key
  })
}

const getSlotName = (tabKey: string): string => tabKey.replace(uuidSuffix, '')

const copySource = ref('')
const { copy, copied } = useClipboard({ source: copySource, legacy: true })
const copyCode = (): void => {
  // Get active tab
  const activeTab = codeTabs.value.find(tab => tab.active)
  if (activeTab) {
    copySource.value = activeTab.copyText || ''
    copy(copySource.value)
  }
}

onBeforeMount(() => {
  codeTabs.value = props.tabs.map((tab, idx) => ({
    key: getTabId(tab.key),
    title: tab.title,
    active: idx === 0,
    copyText: tab.copyText,
  }))
})
</script>

<style lang="scss" scoped>
.mdc-tabs {
  border-radius: $kui-border-radius-50;
  margin: 20px 0;
}

.tabs-container {
  display: flex;
}

.tab-list {
  border-top-left-radius: $kui-border-radius-50;
  color: $kui-color-text;
  display: flex;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  overflow: hidden;
}

.tab-button {
  align-items: center;
  background-color: $kui-color-background-neutral-strong;
  border: 0;
  /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
  border-bottom: $kui-border-width-10 solid $kui-color-background-neutral-strong;
  box-shadow: none;
  color: $kui-color-text-neutral-weak;
  cursor: pointer;
  display: flex;
  font-size: var(--kui-font-size-30, $kui-font-size-30);
  font-weight: $kui-font-weight-medium;
  gap: var(--kui-space-30, $kui-space-30);
  justify-content: center;
  line-height: var(--kui-line-height-30, $kui-line-height-30);
  outline: none;
  overflow: hidden;
  padding: $kui-space-30 $kui-space-60;
  position: relative;
  // Remove tap color highlight on mobile Safari
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  z-index: 10;

  &:focus, &:active, &:focus-visible {
    outline: none;
  }

  &.active {
    background-color: $kui-color-background-neutral-strongest;
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-bottom-color: $kui-color-text-decorative-aqua;
    color: $kui-color-text-inverse;
  }
}

.tab-title {
  z-index: 10;
}

.active-tab-border {
  bottom: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
}

.tab-panel-container {
  display: flex;
  overflow: auto;
}

.tab-panel {
  background-color: $kui-color-background-neutral-strongest;
  border-bottom-left-radius: $kui-border-radius-50;
  border-bottom-right-radius: $kui-border-radius-50;
  color: $kui-color-text-inverse;
  flex: none;
  font-size: $kui-font-size-30;
  min-width: 100%;
  padding: $kui-space-70;

  pre,
  :deep(pre) {
    border: 0;
    margin: 0;
    padding: 0;
  }
}

.tab-not-active {
  background-color: $kui-color-background-neutral-stronger;
  /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
  border-color: $kui-color-background-neutral-strong;
  /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
  border-left: $kui-border-width-10 solid $kui-color-background-neutral-strong;
  border-top-left-radius: $kui-border-radius-20;
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute; right: 0;
  top: 0;

  &-not-last {
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-right: $kui-border-width-10 solid $kui-color-background-neutral-strong;
    bottom: 1px;
    left: 0;
    pointer-events: none;
    position: absolute; right: 0;
    top: 0;
    top: 1px;
    z-index: 20;
  }
}

.tab-filler {
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;

  &.is-rounded {
    border-top-right-radius: $kui-border-radius-50;
  }

  .tab-filler-border {
    background-color: $kui-color-background-neutral-stronger;
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-bottom: $kui-border-width-10 solid $kui-color-background-neutral-strong;
    /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
    border-top: $kui-border-width-10 solid $kui-color-background-neutral-strong;
    display: flex;
    flex: 1 1 auto;
  }
}

.copy-button {
  align-items: center;
  background: $kui-color-background-neutral-stronger;
  border: 0;
  /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
  border-bottom: $kui-border-width-10 solid $kui-color-background-neutral-strong;
  /* stylelint-disable-next-line @kong/design-tokens/use-proper-token */
  border-top: $kui-border-width-10 solid $kui-color-background-neutral-strong;
  border-top-right-radius: $kui-border-radius-50;
  color: $kui-color-text-neutral-weak;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  padding-right: $kui-space-50;
}

:deep(pre) {
  margin-bottom: 0;
  margin-top: 0;
  padding: 0;
}
</style>
