<template>
  <div
    v-if="text"
    class="tooltip-shortcut"
  >
    <div data-testid="shortcut-text">
      {{ text }}
    </div>
    <div
      v-if="keys.length"
      class="keys"
      data-testid="keys"
    >
      <kbd
        :aria-label="isMac ? 'Command' : 'Control'"
        class="keyboard-button meta-key"
        :class="{ 'mac': isMac }"
        data-testid="meta-key"
      />
      <kbd
        v-for="key in keys"
        :key="key"
        class="keyboard-button"
      >
        {{ key }}
      </kbd>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PropType } from 'vue'

defineProps({
  text: {
    type: String,
    required: true,
  },
  keys: {
    type: Array as PropType<string[]>,
    default: () => [],
    validator: (keys: string[]): boolean => {
      if (!keys?.length) {
        return true
      }
      return keys.every((k: any) => typeof k === 'string')
    },
  },
})

const isMac = ref<boolean>(false)

onMounted(() => {
  // Set `isMac` to true if on Mac (for shortcut icons)
  // @ts-ignore - property exists
  isMac.value = /Mac|iPhone|iPod|iPad/i.test(navigator?.platform) || /macOS|Mac|iPhone|iPod|iPad/i.test(navigator?.userAgentData?.platform)
})
</script>

<style lang="scss" scoped>
.tooltip-shortcut {
  align-items: center;
  display: flex;
  flex-direction: column;
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-20, $kui-font-size-20);
  font-weight: var(--kui-font-weight-regular, $kui-font-weight-regular);
  gap: var(--kui-space-30, $kui-space-30);
  justify-content: center;
  user-select: none;

  .keys {
    align-items: center;
    display: flex;
    font-family: var(--kui-font-family-code, $kui-font-family-code);
    gap: var(--kui-space-20, $kui-space-20);
    justify-content: center;
    min-width: auto;
    white-space: nowrap;
  }

  .keyboard-button {
    background: rgba(255, 255, 255, 0.1);
    border: var(--kui-border-width-10, $kui-border-width-10) solid var(--kui-color-border, $kui-color-border);
    border-radius: var(--kui-border-radius-20, $kui-border-radius-20);
    display: block;
    line-height: 1;
    min-width: 0;
    padding: var(--kui-space-20, $kui-space-20) var(--kui-space-30, $kui-space-30);
    position: relative;
    top: -1px;
    width: auto;
  }

  .meta-key {
    // Control
    &:after {
      content: 'Ctrl';
    }

    // Change to Command icon
    &.mac:after {
      content: '\2318';
      font-size: var(--kui-font-size-40, $kui-font-size-40);
      line-height: 0;
      position: relative;
      top: 2px;
    }
  }
}
</style>
