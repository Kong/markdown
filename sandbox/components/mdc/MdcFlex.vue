<template>
  <div class="mdc-flex">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { KUI_SPACE_40 } from '@kong/design-tokens'

const props = defineProps({
  direction: {
    type: String as PropType<'row' | 'column'>,
    default: 'row',
    validator: (dir: string): boolean => !!['row', 'column'].includes(dir),
  },
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
.mdc-flex {
  box-sizing: border-box;
  display: flex;
  flex-direction: v-bind('props.direction');
  flex-wrap: wrap;
  gap: v-bind('props.gap');
  width: v-bind('props.width');

  @media (min-width: $kui-breakpoint-mobile) {
    flex-wrap: nowrap;
  }
}
</style>
