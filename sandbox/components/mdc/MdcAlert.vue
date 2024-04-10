<template>
  <div class="mdc-alert">
    <slot
      name="default"
      unwrap="p"
    />
  </div>
</template>

<style lang="scss" scoped>
.mdc-alert {
  align-items: center;
  background-color: $kui-color-background-danger-weakest;
  border: $kui-border-width-10 solid $kui-color-border-danger-weaker;
  border-radius: $kui-border-radius-30;
  box-sizing: border-box;
  color: $kui-color-text-danger-strong;
  display: flex;
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-medium;
  justify-content: flex-start;
  line-height: $kui-line-height-30;
  margin-bottom: $kui-space-70;
  padding: $kui-space-50 $kui-space-70;
  width: 100%;
}
</style>
