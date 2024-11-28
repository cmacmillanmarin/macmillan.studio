<template>
  <svg :class="['svg__drag', { 'svg__drag--vertical': vertical }]" viewBox="0 0 24 40">
    <path
      d="M0 8h8V3.5e-7L3.5e-7 0 0 8ZM0 40h8v-8H3.5e-7L0 40ZM8 32h8v-8H8v8ZM8 16h8V8H8v8ZM16 24h8v-8h-8v8Z" />
  </svg>
</template>

<script lang="ts" setup>
defineProps<{
  vertical: boolean
}>()
</script>

<style lang="scss">
.svg__drag {
  display: block;
  fill: none;
  width: toScale(2.4rem);
  height: toScale(4rem);
  &--vertical {
    transform: rotate(90deg);
  }
  path {
    fill: red;
  }
}
</style>
