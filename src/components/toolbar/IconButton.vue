<template>
  <button class="icon-button">
    <slot name="default" />
  </button>
</template>

<style lang="scss" scoped>
.icon-button {
  align-items: center;
  background-color: var(--kui-color-background-transparent, $kui-color-background-transparent);
  border: var(--kui-border-width-20, $kui-border-width-20) solid var(--kui-color-border-transparent, $kui-color-border-transparent);
  border-radius: var(--kui-border-radius-30, $kui-border-radius-30);
  color: var(--kui-color-text-neutral, $kui-color-text-neutral);
  cursor: pointer;
  display: inline-flex;
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-30, $kui-font-size-30);
  font-weight: var(--kui-font-weight-semibold, $kui-font-weight-semibold);
  gap: var(--kui-space-30, $kui-space-30);
  justify-content: center;
  padding: var(--kui-space-10, $kui-space-10);
  // Remove tap color highlight on mobile Safari
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  text-decoration: none;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;

  &:hover:not(:disabled):not(:focus):not(:active) {
    background-color: var(--kui-color-background-neutral-weaker, $kui-color-background-neutral-weaker);
  }

  &:focus {
    background-color: var(--kui-color-background-neutral-weaker, $kui-color-background-neutral-weaker);
  }

  &:active {
    background-color: var(--kui-color-background-neutral-weak, $kui-color-background-neutral-weak);
  }

  &:disabled, &[disabled] {
    background-color: var(--kui-color-background-disabled, $kui-color-background-disabled);
    box-shadow: none;
    color: var(--kui-color-text-disabled, $kui-color-text-disabled);
    cursor: not-allowed;

    // If the button is disabled, force-hide any tooltips
    + :deep(.tooltip-content) {
      opacity: 0 !important;
    }
  }

  &:focus, &:active, &:focus-visible {
    outline: none;
  }

  &:focus-visible {
    box-shadow: var(--kui-shadow-focus, $kui-shadow-focus);
  }
}
</style>
