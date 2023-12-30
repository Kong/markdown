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
    padding: var(--kui-space-10, $kui-space-10) var(--kui-space-30, $kui-space-30);

    &.primary {
      background-color: var(--kui-color-background, $kui-color-background);
      border-color: var(--kui-color-border-primary, $kui-color-border-primary);
      color: var(--kui-color-text-primary, $kui-color-text-primary);

      &:hover:not(:disabled):not(:focus):not(:active) {
        background-color: var(--kui-color-background-neutral-weakest, $kui-color-background-neutral-weakest);
        border-color: var(--kui-color-border-primary-stronger, $kui-color-border-primary-stronger);
      }

      &:focus {
        background-color: var(--kui-color-background-neutral-weakest, $kui-color-background-neutral-weakest);
        border-color: var(--kui-color-border-primary-stronger, $kui-color-border-primary-stronger);
      }

      &:active {
        background-color: var(--kui-color-background-neutral-weaker, $kui-color-background-neutral-weaker);
        border-color: var(--kui-color-border-primary-strongest, $kui-color-border-primary-strongest);
      }
    }
  }
}
</style>
