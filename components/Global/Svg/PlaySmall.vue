<template>
  <svg class="svg__play--small" viewBox="0 0 16 24">
    <path d="M8 8h8v8H8zM0 16h8v8H0zM0 0h8v8H0z" />
  </svg>
</template>

<style lang="scss">
.svg__play--small {
  display: block;
  fill: none;
  width: toScale(1.2rem, 37.5rem);
  height: toScale(1.8rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(1.2rem);
    height: toScale(1.8rem);
  }
  path {
    fill: var(--lime);
  }
}
</style>
