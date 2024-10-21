<template>
  <svg class="svg__play--small" viewBox="0 0 16 24">
    <path d="M8 8h8v8H8zM0 16h8v8H0zM0 0h8v8H0z" />
  </svg>
</template>

<style lang="scss">
.svg__play--small {
  display: block;
  fill: none;
  width: toScale(1.6rem);
  height: toScale(2.4rem);
  path {
    fill: var(--lime);
  }
}
</style>
