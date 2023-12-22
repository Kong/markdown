<template>
  <div
    v-if="text"
    class="tooltip-shortcut"
  >
    <div>{{ text }}</div>
    <div
      v-if="keys.length"
      class="keys"
    >
      <kbd
        :aria-label="isMac ? 'Command' : 'Control'"
        class="keyboard-button meta-key"
        :class="{ 'mac': isMac }"
      />
      <kbd
        v-for="key in keys"
        :key="key"
        class="keyboard-button"
      >{{ key }}</kbd>
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
      if (!keys?.length) { return true }
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
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-20;
  font-weight: $kui-font-weight-regular;
  gap: var(--kui-space-30, $kui-space-30);
  justify-content: center;
  user-select: none;

  .keys {
    align-items: center;
    display: flex;
    font-family: $kui-font-family-code;
    gap: var(--kui-space-20, $kui-space-20);
    justify-content: center;
    min-width: auto;
    white-space: nowrap;
  }

  .keyboard-button {
    background: rgba(255, 255, 255, 0.1);
    border: $kui-border-width-10 solid $kui-color-border;
    border-radius: $kui-border-radius-20;
    display: block;
    line-height: 1;
    min-width: 0;
    padding: var(--kui-space-20, $kui-space-20) var(--kui-space-30, $kui-space-30);
    position: relative;
    top: -1px;
    width: auto;
  }

  .meta-key {
    &:after {
      content: 'Ctrl';
    }

    // Change to Command icon
    &.mac:after {
      content: '\2318';
    }
  }
}
</style>
