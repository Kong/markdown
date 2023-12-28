<template>
  <button
    class="toolbar-button"
    :class="[{ 'has-text': !icon }, appearance]"
  >
    <slot name="default" />
  </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  /** Does the button only contain an icon. Defaults to true */
  icon: {
    type: Boolean,
    default: true,
  },
  appearance: {
    type: String as PropType<'primary' | 'secondary'>,
    default: 'secondary',
  },
})
</script>

<style lang="scss" scoped>
@import "../../assets/mixins";

.toolbar-button {
  @include toolbar-button;

  &:disabled, &[disabled] {
    // If the button is disabled, force-hide any tooltips
    + :deep(.tooltip-content) {
      opacity: 0 !important;
    }
  }

  &.has-text {
    border-color: var(--kui-color-border, $kui-color-border);
    border-width: var(--kui-border-width-20, $kui-border-width-20);
    padding: var(--kui-space-10, $kui-space-10) var(--kui-space-40, $kui-space-40);

    &.primary {
      background-color: var(--kui-color-background-primary, $kui-color-background-primary);
      border-color: var(--kui-color-border, $kui-color-border-primary);
      color: var(--kui-color-text-inverse, $kui-color-text-inverse);

      &:hover:not(:disabled):not(:focus):not(:active) {
        background-color: var(--kui-color-background-primary-strong, $kui-color-background-primary-strong);
      }

      &:focus {
        background-color: var(--kui-color-background-primary-strong, $kui-color-background-primary-strong);
      }

      &:active {
        background-color: var(--kui-color-background-primary-stronger, $kui-color-background-primary-stronger);
      }
    }
  }
}
</style>
