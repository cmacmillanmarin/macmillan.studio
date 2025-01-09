<template>
  <div
    :class="['svg__project__ambia-solar', { 'svg__project__ambia-solar--animation': animation }]">
    <SvgProjectAmbiaFirstLine v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    <SvgProjectAmbiaSecondLine v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
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
.svg__project__ambia-solar {
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
    margin-bottom: toScale(1.2rem, 37.5rem);
    @include from__tablet--landscape {
      margin: 0;
      margin-bottom: toScale(1.2rem);
    }
  }

  &__second-line {
    margin: auto;
    @include from__tablet--landscape {
      margin: 0;
      margin-left: 24vw;
    }
  }

  svg path {
    fill: v-bind(fill);
  }
}
</style>
