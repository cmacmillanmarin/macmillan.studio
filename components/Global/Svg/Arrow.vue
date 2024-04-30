<template>
  <svg class="svg__arrow" viewBox="0 0 15 15">
    <line class="svg__arrow__line" x1="0" y1="15" x2="15" y2="0" />
    <line class="svg__arrow__line" x1="0" y1="0" x2="15" y2="0" />
    <line class="svg__arrow__line" x1="15" y1="0" x2="15" y2="15" />
  </svg>
</template>

<style lang="scss">
.svg__arrow {
  overflow: visible;
  width: 1.1rem;
  display: inline-block;
  &__line {
    stroke: var(--black);
    stroke-width: 0.1rem;
  }
}
</style>
