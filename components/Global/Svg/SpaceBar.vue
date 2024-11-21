<template>
  <svg class="svg__space-bar" viewBox="0 0 56 56">
    <g><path d="M25 25v6h6v-6h-6ZM13 25v6h6v-6h-6ZM37 25v6h6v-6h-6Z" /></g>
  </svg>
</template>

<style lang="scss">
.svg__space-bar {
  display: block;
  fill: none;
  width: toScale(4.8rem, 37.5rem);
  height: toScale(4.8rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(5.6rem);
    height: toScale(5.6rem);
  }
  path {
    fill: var(--lime);
  }
}
</style>
