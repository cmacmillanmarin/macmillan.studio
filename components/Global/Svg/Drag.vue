<template>
  <svg :class="['svg__drag', { 'svg__drag--vertical': vertical }]" viewBox="0 0 80 80">
    <path
      d="M54 36h8v8h-8zM46 44h8v8h-8zM46 28h8v8h-8zM26 36h-8v8h8zM34 44h-8v8h8zM34 28h-8v8h8z" />
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
  width: toScale(8rem);
  height: toScale(8rem);
  &--vertical {
    transform: rotate(90deg);
  }
  path {
    fill: var(--lime);
  }
}
</style>
