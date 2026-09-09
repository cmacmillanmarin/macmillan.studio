<template>
  <div :class="['svg__project__melt', { 'svg__project__melt--animation': animation }]">
    <SvgProjectMeltFirstLine v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
  </div>
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'

const props = defineProps<{
  next: boolean
  animation: boolean
  color?: string
}>()

const fill = computed(() => props.color || 'var(--black)')

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__melt {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }

  &__first-line {
    margin: auto;
    @include from__tablet--landscape {
      margin: 0;
      margin-left: 38.85vw;
    }
  }

  svg path {
    fill: v-bind(fill);
  }
}
</style>
