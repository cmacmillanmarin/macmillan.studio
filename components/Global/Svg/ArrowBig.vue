<template>
  <svg :class="['svg__arrow--big', { 'svg__arrow--big-left': side === 1 }]" viewBox="0 0 24 40">
    <path
      d="M0 8h8V3.5e-7L3.5e-7 0 0 8ZM0 40h8v-8H3.5e-7L0 40ZM8 32h8v-8H8v8ZM8 16h8V8H8v8ZM16 24h8v-8h-8v8Z" />
  </svg>
</template>

<script lang="ts" setup>
defineProps<{
  side?: 1 | -1
}>()
</script>

<style lang="scss">
.svg__arrow--big {
  display: block;
  fill: none;
  width: 2.4rem;
  height: 4rem;
  &-left {
    transform: rotate(180deg);
  }
  path {
    fill: var(--lime);
  }
}
</style>
