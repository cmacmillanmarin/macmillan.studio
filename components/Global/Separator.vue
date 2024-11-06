<template>
  <div class="separator">
    <SvgSquare :class="{ 'separator__dot--start': start }" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  left?: number
  start?: boolean
}>()
</script>

<style lang="scss">
.separator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: max(0.2rem, toScale(0.2rem));
  background-color: var(--black);

  .svg__square {
    position: absolute;
    top: toScale(0.1rem);
    width: toScale(1.2rem);
    background-color: var(--black);

    left: calc(
      var(--layout-column-width) * v-bind(left) + var(--layout-gutter) * (v-bind(left) - 1)
    );
    transform: translate(-100%, -100%);
    will-change: transform;

    &.separator__dot--start {
      transform: translate(0%, -100%);
      left: calc(var(--layout-column-width) * v-bind(left) + var(--layout-gutter) * v-bind(left));
    }
  }
}
</style>
