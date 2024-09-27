<template>
  <svg class="svg__close" viewBox="0 0 40 40">
    <path
      d="m16 8 8 3.5e-7 3.5e-7-8-8-3.5e-7zM16 40l8 3.5e-7 3.5e-7-8-8-3.5e-7zM24 32l8 3.5e-7 3.5e-7-8-8-3.5e-7zM24 16l8 3.5e-7 3.5e-7-8-8-3.5e-7zM32 24l8 3.5e-7 3.5e-7-8-8-3.5e-7zM16 32H8v-8h8zM16 16H8V8h8zM8 24H0v-8h8z" />
  </svg>
</template>

<style lang="scss">
.svg__close {
  display: block;
  fill: none;
  width: toScale(4rem);
  height: toScale(4rem);
  transform: rotate(45deg);
  transform-origin: center center;
  path {
    fill: var(--lime);
  }
}
</style>
