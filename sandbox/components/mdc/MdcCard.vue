<template>
  <div class="mdc-card">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.mdc-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  box-sizing: border-box;
  display: block;
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-30;
  height: auto;
  line-height: $kui-line-height-30;
  margin-bottom: $kui-space-50;
  min-height: 100%;
  padding: $kui-space-70;
  width: 100%;

  :deep() {
    h1, h2, h3, h4, h5, h6, p {
      color: $kui-color-text !important;
    }
  }
}
</style>
