<template>
  <button class="icon-button">
    <slot name="default" />
  </button>
</template>

<style lang="scss" scoped>
@import "../../assets/mixins";

.icon-button {
  @include icon-button;

  &:disabled, &[disabled] {
    // If the button is disabled, force-hide any tooltips
    + :deep(.tooltip-content) {
      opacity: 0 !important;
    }
  }
}
</style>
