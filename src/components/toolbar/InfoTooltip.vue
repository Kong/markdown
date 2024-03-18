<template>
  <div
    class="info-tooltip"
  >
    <slot />
    <div
      v-if="!!$slots.tooltip || !!text"
      class="tooltip-content"
    >
      <slot name="tooltip">
        {{ text }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps({
  text: {
    type: String,
    default: undefined,
  },
})
</script>

<style lang="scss" scoped>
.info-tooltip {
  display: inline-block;
  position: relative;
  width: max-content;

  &:hover,
  &:focus-within {
    .tooltip-content {
      @media (min-width: $kui-breakpoint-mobile) {
        opacity: 1;
      }
    }
  }
}

.tooltip-content {
  background: var(--kui-color-background-inverse, $kui-color-background-inverse);
  border-radius: var(--kui-border-radius-20, $kui-border-radius-20);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  color: var(--kui-color-text-inverse, $kui-color-text-inverse);
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-20, $kui-font-size-20);
  font-weight: var(--kui-font-weight-medium, $kui-font-weight-medium);
  left: 50%;
  line-height: var(--kui-line-height-20, $kui-line-height-20);
  max-width: 200px;
  opacity: 0;
  padding: var(--kui-space-40, $kui-space-40);
  pointer-events: none;
  position: absolute;
  top: calc(100% + 4px);
  transform: translateX(-50%);
  transition: opacity 0.2s ease-in-out;
  width: max-content;
  z-index: 1;
}
</style>
