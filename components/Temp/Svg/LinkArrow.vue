<template>
  <svg class="svg__link-arrow" viewBox="0 0 13 13">
    <path d="M1 11.5 11.5 1m0 0h-9m9 0v9" />
  </svg>
</template>

<style lang="scss">
.svg__link-arrow {
  display: block;
  width: toScale(1.3rem);
  height: toScale(1.3rem);
  fill: none;
  path {
    stroke: var(--black);
    stroke-width: 2;
  }
}
</style>
