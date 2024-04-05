<template>
  <div class="mdc-grid-item">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  gridColumn: {
    type: String,
    default: '1',
  },
  gridRow: {
    type: String,
    default: '1',
  },
})
</script>

<style lang="scss" scoped>
.mdc-grid-item {
  box-sizing: border-box;
  display: block;
  grid-column: v-bind('props.gridColumn');
  grid-row: v-bind('props.gridRow');
}
</style>
