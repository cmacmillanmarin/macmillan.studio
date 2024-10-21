<template>
  <svg class="svg__play" viewBox="0 0 24 40">
    <path d="m0 24 8 3.5e-7 3.5e-7-8-8-3.5e-7z" />
    <path
      d="m0 24 8 3.5e-7 3.5e-7-8-8-3.5e-7zM0 8l8 3.5e-7 3.5e-7-8-8-3.5e-7zM0 40l8 3.5e-7 3.5e-7-8-8-3.5e-7zM8 32l8 3.5e-7 3.5e-7-8-8-3.5e-7zM8 16l8 3.5e-7 3.5e-7-8-8-3.5e-7zM16 24l8 3.5e-7 3.5e-7-8-8-3.5e-7z" />
  </svg>
</template>

<style lang="scss">
.svg__play {
  display: block;
  fill: none;
  width: toScale(2.4rem);
  height: toScale(4rem);
  path {
    fill: var(--lime);
  }
}
</style>
