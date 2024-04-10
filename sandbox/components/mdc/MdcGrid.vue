<template>
  <div class="mdc-grid">
    <slot
      name="default"
    />
  </div>
</template>

<script setup lang="ts">
import { KUI_SPACE_40 } from '@kong/design-tokens'

const props = defineProps({
  gap: {
    type: String,
    default: KUI_SPACE_40,
  },
  width: {
    type: String,
    default: '100%',
  },
})
</script>

<style lang="scss" scoped>
.mdc-grid {
  box-sizing: border-box;
  display: grid;
  grid-gap: v-bind('props.gap');
  width: v-bind('props.width');
}
</style>
